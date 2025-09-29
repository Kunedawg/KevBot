import { NextRequest, NextResponse } from "next/server";
import { ApiTrack, PaginatedResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = searchParams.get("offset") || "0";
  const limit = searchParams.get("limit") || "20";

  const res = await fetch(`${API_BASE_URL}/v1/tracks?offset=${offset}&limit=${limit}`, {
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
