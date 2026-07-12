export type StoredAuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

const TOKEN_KEY = "transitops.auth.token";
const USER_KEY = "transitops.auth.user";

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredAuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredAuthUser;
    } catch {
        return null;
    }
}

export function setStoredSession(token: string, user: StoredAuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
