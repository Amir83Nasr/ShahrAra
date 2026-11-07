/**
 * Shared API helpers.
 *
 * The backend always answers failures with:
 *   { success: false, error: { code, message, fields? } }
 * Components used to read `detail` or treat `error` as a string, which showed
 * generic messages (and `[object Object]` in the submit form).
 */

export const UNAUTHORIZED_EVENT = "shahr-ara:unauthorized";

export interface ApiErrorField {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code: number;
  fields: ApiErrorField[];

  constructor(
    message: string,
    options: { status?: number; code?: number; fields?: ApiErrorField[] } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? options.status ?? 0;
    this.fields = options.fields ?? [];
  }
}

type ErrorPayload = {
  success?: boolean;
  error?:
    string | { code?: number; message?: string; fields?: ApiErrorField[] };
  detail?: string | unknown[];
};

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiError(
      "ارتباط با سرور برقرار نشد. از اتصال اینترنت خود مطمئن شوید.",
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw toApiError(response, payload);
  }

  return payload as T;
}

function toApiError(response: Response, payload: unknown): ApiError {
  const body = (payload ?? {}) as ErrorPayload;
  const envelope = body.error;

  if (envelope && typeof envelope === "object") {
    return new ApiError(envelope.message || "خطایی در پردازش درخواست رخ داد.", {
      status: response.status,
      code: envelope.code ?? response.status,
      fields: envelope.fields,
    });
  }

  if (typeof envelope === "string") {
    return new ApiError(envelope, { status: response.status });
  }

  if (typeof body.detail === "string") {
    return new ApiError(body.detail, { status: response.status });
  }

  if (response.status === 401) {
    return new ApiError("شما دسترسی ندارید. لطفاً وارد حساب خود شوید.", {
      status: 401,
    });
  }

  return new ApiError("خطایی در پردازش درخواست رخ داد.", {
    status: response.status,
  });
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function authHeaders(
  token: string | null | undefined,
  json = false,
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
