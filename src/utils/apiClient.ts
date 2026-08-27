/**
 * Safe API client for frontend requests to ensure clear, descriptive error handling
 * and prevent raw "Unexpected token '<', <!DOCTYPE... is not valid JSON" crashes.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  rawText?: string;
}

export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        if (!res.ok) {
          const errorMsg = data.error_description || data.error || data.message || `API Error (HTTP ${res.status})`;
          return { ok: false, status: res.status, error: errorMsg, data };
        }
        return { ok: true, status: res.status, data };
      } catch (jsonErr: any) {
        return {
          ok: false,
          status: res.status,
          error: `Failed to parse server JSON response: ${jsonErr.message}`,
        };
      }
    }

    // Response is NOT JSON (e.g. HTML error page or 404 from Vercel / proxy)
    const text = await res.text();
    const isHtml = text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<html');

    let errorMessage = `Server returned HTTP ${res.status}`;
    if (isHtml) {
      if (res.status === 404) {
        errorMessage = `API endpoint "${url}" was not found (HTTP 404). If deployed on Vercel, ensure vercel.json and the /api serverless function are deployed, and check Vercel Project Environment Variables.`;
      } else if (res.status === 500) {
        errorMessage = `Server Error (HTTP 500). Please check your backend / Vercel Serverless Function deployment logs.`;
      } else {
        errorMessage = `Server returned an HTML page (${res.status} ${res.statusText}) instead of JSON. Ensure the backend serverless API is running.`;
      }
    } else if (text) {
      errorMessage = text.slice(0, 300);
    }

    return {
      ok: false,
      status: res.status,
      error: errorMessage,
      rawText: text,
    };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      error: netErr.message ? `Network request failed: ${netErr.message}` : 'Network error or server unreachable',
    };
  }
}
