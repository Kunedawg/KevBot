import { NextRequest, NextResponse } from "next/server";
import { ApiTrack, PaginatedResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ALLOWED_PARAMS = ["offset", "limit", "name", "q", "search_mode", "sort", "order", "include_deleted"] as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const upstreamUrl = new URL(`${API_BASE_URL}/v1/tracks`);

  const offset = searchParams.get("offset") ?? "0";
  const limit = searchParams.get("limit") ?? "20";
  upstreamUrl.searchParams.set("offset", offset);
  upstreamUrl.searchParams.set("limit", limit);

  for (const key of ALLOWED_PARAMS.slice(2)) {
    const value = searchParams.get(key);
    if (value !== null) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  const res = await fetch(upstreamUrl.toString(), {
    headers: {
      "Content-Type": "application/json",
      // Add any auth headers here if needed
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: res.status });
  }

  const data: PaginatedResponse<ApiTrack> = await res.json();
  return NextResponse.json(data);
}
