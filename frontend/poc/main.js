
let credentials = {
    url: '',
    email: '',
    token: ''
};

const dom = {
    loginForm: document.getElementById('login-form'),
    mainContent: document.getElementById('main-content'),
    urlInput: document.getElementById('jira-url'),
    emailInput: document.getElementById('jira-email'),
    tokenInput: document.getElementById('jira-token'),
    connectBtn: document.getElementById('connect-btn'),
    issueList: document.getElementById('issue-list'),
    errorContainer: document.getElementById('error-container'),
    refreshBtn: document.getElementById('refresh-btn'),
    logoutBtn: document.getElementById('logout-btn')
};

function getAuthHeader() {
    const auth = btoa(`${credentials.email}:${credentials.token}`);
    return `Basic ${auth}`;
}

function getBaseUrl() {
    let url = credentials.url.replace(/\/$/, "");
    // Correction for Jira Cloud if needed, but usually API is at /rest/api/2
    // If user enters https://xxx.atlassian.net, we append /rest/api/2...
    // If user enters https://xxx.atlassian.net/jira, we might need to handle it.
    // For now, assume standard cloud URL.
    return url;
}

function toggleView(showMain) {
    if (showMain) {
        dom.loginForm.classList.add('hidden');
        dom.mainContent.classList.remove('hidden');
    } else {
        dom.loginForm.classList.remove('hidden');
        dom.mainContent.classList.add('hidden');
    }
}

async function fetchIssues() {
    dom.errorContainer.classList.add('hidden');
    dom.errorContainer.textContent = '';
    dom.issueList.innerHTML = '<li class="loading">Loading...</li>';

    try {
        const baseUrl = getBaseUrl();
        // Use the exact endpoint recommended by Jira: /rest/api/3/search/jql
        // Explicitly requesting fields (summary, key, status) as v3 might exclude them by default
        const response = await fetch(`/api/rest/api/3/search/jql?jql=created%20>%3D%20-3000w%20order%20by%20updated%20desc&fields=summary,status,key,description`, {
            headers: {
                'Authorization': getAuthHeader(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Jira-Url': baseUrl
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized. Check credentials.");
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderIssues(data.issues);
    } catch (error) {
        console.error('Fetch error:', error);
        dom.errorContainer.textContent = `Error fetching issues: ${error.message}`;
        dom.errorContainer.classList.remove('hidden');
        dom.issueList.innerHTML = '';
    }
}

function renderIssues(issues) {
    dom.issueList.innerHTML = '';

    if (!issues || issues.length === 0) {
        dom.issueList.innerHTML = '<li>No issues found for current user.</li>';
        return;
    }

    issues.forEach(issue => {
        const li = document.createElement('li');
        li.className = 'issue-card';

        const info = document.createElement('div');
        info.className = 'issue-info';
        const summary = issue.fields?.summary || 'No Summary';
        const key = issue.key || issue.id; // Fallback if key is missing

        info.innerHTML = `
      <span class="issue-key">${key}</span>
      <span class="issue-summary">${summary}</span>
    `;

        const actions = document.createElement('div');
        actions.className = 'issue-actions';

        const btn = document.createElement('button');
        btn.textContent = 'Change Title';
        btn.onclick = () => handleChangeTitle(issue);

        actions.appendChild(btn);
        li.appendChild(info);
        li.appendChild(actions);
        dom.issueList.appendChild(li);
    });
}

async function handleChangeTitle(issue) {
    const newTitle = prompt(`Enter new title for ${issue.key}:`, issue.fields.summary);
    if (!newTitle || newTitle === issue.fields.summary) return;

    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`/api/rest/api/3/issue/${issue.key}`, {
            method: 'PUT',
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json',
                'X-Jira-Url': baseUrl
            },
            body: JSON.stringify({
                fields: {
                    summary: newTitle
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update title: ${response.status}`);
        }

        // Optimistic update or refresh
        alert('Title updated successfully! Refreshing list...');
        fetchIssues();

    } catch (error) {
        alert(`Error updating title: ${error.message}`);
    }
}

// Event Listeners
dom.connectBtn.addEventListener('click', () => {
    const url = dom.urlInput.value.trim();
    const email = dom.emailInput.value.trim();
    const token = dom.tokenInput.value.trim();

    if (!url || !email || !token) {
        alert("Please fill in all fields.");
        return;
    }

    credentials = { url, email, token };
    toggleView(true);
    fetchIssues();
});

dom.refreshBtn.addEventListener('click', fetchIssues);

dom.logoutBtn.addEventListener('click', () => {
    credentials = { url: '', email: '', token: '' };
    dom.tokenInput.value = ''; // Clear token for security
    toggleView(false);
});

// Check if already has values (dev convenience)
if (dom.tokenInput.value) {
    // optional: auto connect if token is pre-filled (unlikely for password field)
}
