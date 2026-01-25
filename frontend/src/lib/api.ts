/**
 * API client for LaColaRij backend communication.
 */

import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthToken,
  JiraConnection,
  JiraConnectionCreate,
} from '@/types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.token}`;
    }

    const url = `${API_BASE}${endpoint}`;
    console.log(`[api] request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(
      `[api] response: ${response.status} ${response.statusText} for ${url}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.log(`[api] error:`, error);
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // FastAPI expects form data for OAuth2
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async demoLogin(): Promise<AuthToken> {
    return this.request<AuthToken>('/auth/demo-login', {
      method: 'POST',
    });
  }

  // Connection endpoints
  async listConnections(): Promise<JiraConnection[]> {
    return this.request<JiraConnection[]>('/users/connections');
  }

  async createConnection(
    connection: JiraConnectionCreate
  ): Promise<JiraConnection> {
    return this.request<JiraConnection>('/users/connections', {
      method: 'POST',
      body: JSON.stringify(connection),
    });
  }

  async deleteConnection(id: string): Promise<void> {
    return this.request<void>(`/users/connections/${id}`, {
      method: 'DELETE',
    });
  }

  async getConnection(id: string): Promise<JiraConnection> {
    return this.request<JiraConnection>(`/users/connections/${id}`);
  }

  // JIRA relay endpoints
  async jiraRequest<T>(
    connectionId: string,
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const fullPath = `/jira/${connectionId}${path}`;
    console.log(
      `[api] jiraRequest: connectionId=${connectionId}, path=${path}, fullPath=${fullPath}`
    );
    return this.request<T>(fullPath, options);
  }

  async searchIssues(
    connectionId: string,
    params: {
      jql?: string;
      nextPageToken?: string;
      maxResults?: number;
      fields?: string[];
    } = {}
  ): Promise<JiraSearchResponse> {
    console.log(`[api] searchIssues called with jql: "${params.jql}"`);
    const queryParams = new URLSearchParams();
    if (params.jql) {
      queryParams.set('jql', params.jql);
    } else {
      // DEFENSIVE: Always include a bounded JQL to prevent Jira rejection
      console.warn('[api] searchIssues: jql is empty, using fallback');
      queryParams.set('jql', 'created >= -3000w ORDER BY updated ASC');
    }
    if (params.nextPageToken)
      queryParams.set('nextPageToken', params.nextPageToken);
    if (params.maxResults !== undefined)
      queryParams.set('maxResults', params.maxResults.toString());
    if (params.fields) queryParams.set('fields', params.fields.join(','));

    const query = queryParams.toString();
    return this.jiraRequest<JiraSearchResponse>(
      connectionId,
      `/rest/api/3/search/jql${query ? `?${query}` : ''}`
    );
  }

  async getIssue(
    connectionId: string,
    issueIdOrKey: string
  ): Promise<JiraIssue> {
    return this.jiraRequest<JiraIssue>(
      connectionId,
      `/rest/api/3/issue/${issueIdOrKey}`
    );
  }

  async updateIssue(
    connectionId: string,
    issueIdOrKey: string,
    update: { fields: Record<string, unknown> }
  ): Promise<void> {
    return this.jiraRequest<void>(
      connectionId,
      `/rest/api/3/issue/${issueIdOrKey}`,
      {
        method: 'PUT',
        body: JSON.stringify(update),
      }
    );
  }

  async createIssue(
    connectionId: string,
    payload: { fields: Record<string, unknown> }
  ): Promise<{ id: string; key: string; self: string }> {
    return this.jiraRequest<{ id: string; key: string; self: string }>(
      connectionId,
      `/rest/api/3/issue`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async getTransitions(
    connectionId: string,
    issueIdOrKey: string
  ): Promise<{ transitions: JiraTransition[] }> {
    return this.jiraRequest<{ transitions: JiraTransition[] }>(
      connectionId,
      `/rest/api/3/issue/${issueIdOrKey}/transitions`
    );
  }

  async transitionIssue(
    connectionId: string,
    issueIdOrKey: string,
    transitionId: string
  ): Promise<void> {
    return this.jiraRequest<void>(
      connectionId,
      `/rest/api/3/issue/${issueIdOrKey}/transitions`,
      {
        method: 'POST',
        body: JSON.stringify({ transition: { id: transitionId } }),
      }
    );
  }

  async getComments(
    connectionId: string,
    issueIdOrKey: string
  ): Promise<{
    comments: JiraComment[];
    total: number;
    startAt: number;
    maxResults: number;
  }> {
    console.log(
      `[api] getComments called: connectionId=${connectionId}, issueKey=${issueIdOrKey}`
    );
    const result = await this.jiraRequest<{
      comments: JiraComment[];
      total: number;
      startAt: number;
      maxResults: number;
    }>(connectionId, `/rest/api/3/issue/${issueIdOrKey}/comment`);
    console.log(`[api] getComments result:`, result);
    return result;
  }

  async addComment(
    connectionId: string,
    issueIdOrKey: string,
    body: unknown
  ): Promise<JiraComment> {
    return this.jiraRequest<JiraComment>(
      connectionId,
      `/rest/api/3/issue/${issueIdOrKey}/comment`,
      {
        method: 'POST',
        body: JSON.stringify({ body }),
      }
    );
  }
}

// JIRA API response types
export interface JiraSearchResponse {
  startAt: number;
  maxResults: number;
  total: number;
  nextPageToken?: string;
  issues: JiraIssue[];
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description: unknown | null;
    status: {
      id: string;
      name: string;
      statusCategory: {
        id: number;
        key: string;
        name: string;
      };
    };
    issuetype: {
      id: string;
      name: string;
      iconUrl?: string;
    };
    priority?: {
      id: string;
      name: string;
      iconUrl?: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      avatarUrls?: Record<string, string>;
    } | null;
    reporter?: {
      accountId: string;
      displayName: string;
    };
    project: {
      id: string;
      key: string;
      name: string;
    };
    labels?: string[];
    created: string;
    updated: string;
    comment?: {
      comments: JiraComment[];
      total: number;
    };
  };
}

export interface JiraComment {
  id: string;
  body: unknown;
  author: {
    accountId?: string;
    displayName: string;
  };
  created: string;
  updated: string;
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
    statusCategory: {
      id: number;
      key: string;
      name: string;
    };
  };
}

// Export singleton instance
export const api = new ApiClient();
