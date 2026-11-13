/**
 * Next.js Catch-All API Route — Embedded Express Handler
 *
 * Runs the Express backend DIRECTLY inside Next.js serverless functions.
 * No separate backend deployment needed — one Vercel project serves everything.
 *
 * Request flow:
 *   Browser → /api/* → Next.js (this file) → Express app (in-process) → Response
 */

import { NextRequest, NextResponse } from 'next/server';

// Runtime: Node.js (not Edge) so we can use require() and Node APIs
export const runtime = 'nodejs';

type Params = Promise<{ path: string[] }>;

// Lazy-load and cache the Express app
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedApp: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getExpressApp(): Promise<any> {
  if (cachedApp) return cachedApp;
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const app = require('../../../../server/src/index.js');
      cachedApp = app;
      resolve(app);
    } catch (err) {
      reject(err);
    }
  });

  return initPromise;
}

async function runExpressHandler(
  expressApp: (req: import('http').IncomingMessage, res: import('http').ServerResponse) => void,
  method: string,
  url: string,
  headers: Record<string, string>,
  bodyBuffer: Buffer | null
): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> {
  // We use Node's http.IncomingMessage / ServerResponse to bridge Next → Express
  const { IncomingMessage, ServerResponse } = await import('http');
  const { Socket } = await import('net');

  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;

    // Apply headers
    for (const [key, value] of Object.entries(headers)) {
      req.headers[key.toLowerCase()] = value;
    }
    if (bodyBuffer) {
      req.headers['content-length'] = String(bodyBuffer.length);
    }

    const resHeaders: Record<string, string> = {};
    let statusCode = 200;
    const chunks: Buffer[] = [];

    const res = new ServerResponse(req);

    // Intercept writeHead
    const originalWriteHead = res.writeHead.bind(res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.writeHead = (code: number, _msg?: any, hdrs?: any) => {
      statusCode = code;
      const h = hdrs || (_msg && typeof _msg === 'object' ? _msg : {});
      for (const [k, v] of Object.entries(h)) {
        resHeaders[k.toLowerCase()] = String(v);
      }
      return originalWriteHead(code, h);
    };

    // Intercept setHeader
    res.setHeader = (name: string, value: string | number | readonly string[]) => {
      resHeaders[name.toLowerCase()] = Array.isArray(value) ? String(value[0]) : String(value);
      return res;
    };

    // Intercept write
    const originalWrite = res.write.bind(res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.write = (chunk: any, ...args: any[]) => {
      if (chunk) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalWrite(chunk, ...args as any);
    };

    // Intercept end
    const originalEnd = res.end.bind(res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.end = (chunk?: any, ...args: any[]) => {
      if (chunk) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
      }
      resolve({
        status: statusCode,
        headers: resHeaders,
        body: Buffer.concat(chunks),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return originalEnd(chunk, ...args as any);
    };

    // Inject body into the request stream, then signal end
    try {
      expressApp(req, res);

      if (bodyBuffer && bodyBuffer.length > 0) {
        req.emit('data', bodyBuffer);
      }
      req.emit('end');
    } catch (err) {
      reject(err);
    }
  });
}

async function handleRequest(req: NextRequest, params: Params): Promise<NextResponse> {
  const { path } = await params;
  const pathStr = Array.isArray(path) ? path.join('/') : (path ?? '');
  const search = req.nextUrl.search || '';
  const expressUrl = `/api/${pathStr}${search}`;

  // Read request body once
  let bodyBuffer: Buffer | null = null;
  const method = req.method.toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) {
    const ab = await req.arrayBuffer();
    if (ab.byteLength > 0) {
      bodyBuffer = Buffer.from(ab);
    }
  }

  // Build headers map
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  try {
    const expressApp = await getExpressApp();

    const result = await runExpressHandler(
      expressApp,
      method,
      expressUrl,
      headers,
      bodyBuffer
    );

    const resHeaders = new Headers();
    for (const [k, v] of Object.entries(result.headers)) {
      if (!['transfer-encoding', 'connection'].includes(k)) {
        resHeaders.set(k, v);
      }
    }

    return new NextResponse(new Uint8Array(result.body), {
      status: result.status,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API Route] Express handler error:', message);
    return NextResponse.json(
      { success: false, message: `Internal server error: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function POST(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function HEAD(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
export async function OPTIONS(req: NextRequest, { params }: { params: Params }) {
  return handleRequest(req, params);
}
