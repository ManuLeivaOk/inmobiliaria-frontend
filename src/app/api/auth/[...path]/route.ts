import { NextRequest, NextResponse } from "next/server";

// Fuerza a Next.js a no cachear las respuestas de este API Route (crucial para auth/refresh)
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:3000";

async function proxyAuthRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const subPath = pathSegments.join("/");
  const targetUrl = `${BACKEND_URL}/api/auth/${subPath}${request.nextUrl.search}`;

  // 1. Clonar headers de la petición entrante hacia el backend
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length"
    ) {
      return;
    }
    
    // 🛡️ ANTIDUPLICADO DE COOKIES: Si es el header de cookies, nos aseguramos de no mandar basura
    if (lower === "cookie") {
      // Separamos las cookies por punto y coma
      const cookiePairs = value.split(';');
      const uniqueCookies = new Map<string, string>();
  
      cookiePairs.forEach(pair => {
        const [cookieKey, cookieVal] = pair.split('=');
        if (cookieKey && cookieVal) {
          // Al usar un Map, si viene 'refresh_token' dos veces, 
          // la última versión (que suele ser la más nueva) pisará a la vieja.
          uniqueCookies.set(cookieKey.trim(), cookieVal.trim());
        }
      });
  
      // Reconstruimos el string de cookies limpio
      const cleanCookieString = Array.from(uniqueCookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
  
      headers.set(key, cleanCookieString);
      return;
    }
  
    headers.set(key, value);
  });
  // 2. Procesar el body si corresponde
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  // 3. Petición al backend externo
  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  // 4. Clonar headers de respuesta del backend (excluyendo set-cookie temporalmente)
  const responseHeaders = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  const responseBody =
    backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();

  // 5. Instanciar la respuesta de Next.js
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });

  // 6. Extraer las cookies reales del backend y adjuntarlas limpiamente a la respuesta
  const rawCookies = backendResponse.headers.getSetCookie();
  if (rawCookies && rawCookies.length > 0) {
    rawCookies.forEach((cookieString) => {
      response.headers.append("Set-Cookie", cookieString);
    });
  }

  return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuthRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuthRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuthRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuthRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyAuthRequest(request, path);
}