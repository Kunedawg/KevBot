import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Forward range headers for proper streaming support
  const range = request.headers.get("range");
  const headers: HeadersInit = {
    "Content-Type": "audio/mpeg",
  };

  if (range) {
    headers["Range"] = range;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/v1/tracks/${id}/stream`, {
      headers,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to stream track" }, { status: res.status });
    }

    // Forward the response with appropriate headers
    const responseHeaders: HeadersInit = {
      "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
      "Accept-Ranges": "bytes",
    };

    // Forward range-related headers if present
    const contentRange = res.headers.get("Content-Range");
    const contentLength = res.headers.get("Content-Length");

    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    const status = res.status === 206 ? 206 : 200;

    return new NextResponse(res.body, {
      status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
