/**
 * Next.js Catch-All API Proxy Route
 *
 * Forwards all /api/* requests to the Express backend.
 * - In production (Vercel): forwards to BACKEND_URL env var
 * - In local dev: forwards to http://localhost:5000
 *
 * This means the frontend and backend can live as separate Vercel projects
 * or run together locally with a single Next.js app handling routing.
 */

import { NextRequest, NextResponse } from 'next/server';

// The Express backend URL (no trailing slash)
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

type Params = Promise<{ path: string[] }>;

async function proxyRequest(
  req: NextRequest,
  params: Params
): Promise<NextResponse> {
  const { path } = await params;
  const pathStr = path ? path.join('/') : '';
  const search = req.nextUrl.search || '';
  const targetUrl = `${BACKEND_URL}/api/${pathStr}${search}`;

  // Build headers to forward (exclude host to avoid conflicts)
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  try {
    let body: BodyInit | undefined;
    const method = req.method.toUpperCase();
    if (!['GET', 'HEAD'].includes(method)) {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await req.text();
      } else {
        body = await req.arrayBuffer();
      }
    }

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Forward response body and status
    const responseBody = await backendRes.arrayBuffer();
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      // Skip headers that Next.js manages itself
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[API Proxy] Failed to reach backend at ${targetUrl}:`, message);
    return NextResponse.json(
      {
        success: false,
        message: `Backend service unavailable. Could not reach ${BACKEND_URL}. Error: ${message}`,
      },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function POST(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function HEAD(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
export async function OPTIONS(req: NextRequest, { params }: { params: Params }) {
  return proxyRequest(req, params);
}
