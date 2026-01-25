interface LogoProps {
  size?: number;
}

export function Logo({ size = 32 }: LogoProps) {
  // Original dimensions: 65x58 (width x height)
  // Scale factor based on desired height
  const aspectRatio = 65 / 58;
  const height = size;
  const width = size * aspectRatio;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 65 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Data Stack Logo"
    >
      {/* Layer 1 - Red */}
      <rect x="0" y="0" width="60" height="10" rx="5" fill="#E61D2B" />
      {/* Layer 2 - Orange (offset 5px right) */}
      <rect x="5" y="16" width="50" height="10" rx="5" fill="#FF8F00" />
      {/* Layer 3 - Blue */}
      <rect x="0" y="32" width="60" height="10" rx="5" fill="#0052CC" />
      {/* Layer 4 - Green (offset 5px right) */}
      <rect x="5" y="48" width="50" height="10" rx="5" fill="#36B37E" />
    </svg>
  );
}
