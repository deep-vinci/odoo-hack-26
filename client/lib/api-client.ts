import { env } from "@/lib/env";

export class ApiError extends Error {
    readonly status: number;
    readonly data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

/**
 * Thin fetch wrapper around the backend API.
 * - Prefixes {@link env.apiUrl}.
 * - Sends/receives JSON and includes credentials (cookies) by default.
 * - Throws {@link ApiError} on non-2xx responses.
 */
export async function apiFetch<T>(
    path: string,
    { body, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
    const res = await fetch(`${env.apiUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
        const message =
            (isJson && (data as { message?: string })?.message) ||
            res.statusText;
        throw new ApiError(message, res.status, data);
    }

    return data as T;
}
