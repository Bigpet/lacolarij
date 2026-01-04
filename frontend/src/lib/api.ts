/**
 * API client for backend communication.
 */

import type {
  User,
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
  JiraConnection,
  JiraConnectionCreate,
  ApiError,
} from "@/types";

const API_BASE = "/api";

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
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    // OAuth2 form data format
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: "Login failed",
      }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // Connection endpoints
  async listConnections(): Promise<JiraConnection[]> {
    return this.request<JiraConnection[]>("/users/connections");
  }

  async createConnection(
    connection: JiraConnectionCreate
  ): Promise<JiraConnection> {
    return this.request<JiraConnection>("/users/connections", {
      method: "POST",
      body: JSON.stringify(connection),
    });
  }

  async updateConnection(
    id: string,
    connection: Partial<JiraConnectionCreate>
  ): Promise<JiraConnection> {
    return this.request<JiraConnection>(`/users/connections/${id}`, {
      method: "PUT",
      body: JSON.stringify(connection),
    });
  }

  async deleteConnection(id: string): Promise<void> {
    return this.request<void>(`/users/connections/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
