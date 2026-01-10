#!/usr/bin/env python3
"""Extract Playwright test failures from junit.xml into individual markdown files."""

import glob
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path


def sanitize_filename(name: str) -> str:
    """Convert test name to a safe filename."""
    # Replace problematic characters
    name = re.sub(r'[<>:"/\\|?*]', '_', name)
    name = re.sub(r'\s+', '_', name)
    name = re.sub(r'_+', '_', name)
    name = name.strip('_')
    # Truncate if too long
    if len(name) > 100:
        name = name[:100]
    return name


def strip_attachments(content: str) -> str:
    """Remove attachment sections from failure content."""
    # Pattern matches attachment blocks like:
    # attachment #1: screenshot (image/png) ──────...
    # ...content...
    # ──────────────────────────────────────────────
    lines = content.split('\n')
    result = []
    in_attachment = False

    for line in lines:
        # Check if this is an attachment header
        if re.match(r'\s*attachment #\d+:', line):
            in_attachment = True
            continue

        # Check if this is a separator line (ends attachment block)
        if in_attachment and re.match(r'\s*─{20,}', line):
            in_attachment = False
            continue

        # Skip lines inside attachment blocks
        if in_attachment:
            continue

        # Also skip "Error Context:" lines that reference files
        if re.match(r'\s*Error Context:', line):
            continue

        # Skip "Usage:" and trace command lines
        if re.match(r'\s*Usage:', line):
            in_attachment = True  # Skip until next separator
            continue

        result.append(line)

    return '\n'.join(result)


def extract_failures(junit_path: str, output_dir: str) -> None:
    """Extract failures from junit.xml to individual markdown files."""
    junit_file = Path(junit_path)
    output_path = Path(output_dir)

    if not junit_file.exists():
        print(f"Error: {junit_file} not found")
        return

    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)

    # Parse XML
    tree = ET.parse(junit_file)
    root = tree.getroot()

    failure_count = 0

    for testsuite in root.findall('.//testsuite'):
        suite_name = testsuite.get('name', 'unknown')

        for testcase in testsuite.findall('testcase'):
            failure = testcase.find('failure')
            if failure is None:
                continue

            test_name = testcase.get('name', 'unknown')
            classname = testcase.get('classname', suite_name)
            time_taken = testcase.get('time', '0')
            failure_message = failure.get('message', '')
            failure_content = failure.text or ''

            # Strip attachments from content
            cleaned_content = strip_attachments(failure_content)

            # Create markdown content
            md_content = f"""# Test Failure: {test_name}

## Test Info
- **File**: `{classname}`
- **Test**: {test_name}
- **Duration**: {time_taken}s

## Failure Message
{failure_message}

## Details
```
{cleaned_content.strip()}
```
"""

            # Create filename
            filename = sanitize_filename(f"{classname}_{test_name}") + '.md'
            filepath = output_path / filename

            filepath.write_text(md_content)
            failure_count += 1
            print(f"Created: {filepath}")

    print(f"\nExtracted {failure_count} failures to {output_path}")


if __name__ == '__main__':
    mdfiles = glob.glob('./pwfailure/*.md')
    for md in mdfiles:
        os.remove(md)
    extract_failures(
        'frontend/e2e/test-results/junit.xml',
        './pwfailure'
    )
