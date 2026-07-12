import { env } from "@/lib/env";
import { clearStoredSession, getStoredToken } from "@/lib/auth-storage";

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details: unknown;
    readonly data: unknown;

    constructor(
        message: string,
        status: number,
        code: string,
        data?: unknown,
        details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.data = data;
        this.details = details;
    }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    auth?: boolean;
};

type SuccessEnvelope<T> = { success: true; data: T };
type ErrorEnvelope = {
    success: false;
    error: { code: string; message: string; details?: unknown };
};

export async function apiFetch<T>(
    path: string,
    { body, headers, auth = true, ...init }: ApiFetchOptions = {},
): Promise<T> {
    const authHeaders: Record<string, string> = {};
    if (auth) {
        const token = getStoredToken();
        if (token) authHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${env.apiUrl}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
    const payload = isJson ? await res.json() : await res.text();

    if (!res.ok) {
        if (res.status === 401 && auth) {
            clearStoredSession();
        }
        const envelope = payload as ErrorEnvelope;
        const message = (isJson && envelope?.error?.message) || res.statusText;
        const code = (isJson && envelope?.error?.code) || "REQUEST_FAILED";
        throw new ApiError(
            message,
            res.status,
            code,
            payload,
            isJson ? envelope?.error?.details : undefined,
        );
    }

    if (isJson && payload && (payload as SuccessEnvelope<T>).success) {
        return (payload as SuccessEnvelope<T>).data;
    }

    return payload as T;
}
