import { NextRequest, NextResponse } from "next/server";
import { TrackSuggestionResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  const limit = searchParams.get("limit") ?? "10";

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const upstreamUrl = new URL(`${API_BASE_URL}/v1/tracks/suggest`);
  upstreamUrl.searchParams.set("q", q);
  upstreamUrl.searchParams.set("limit", limit);

  const res = await fetch(upstreamUrl.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch track suggestions" }, { status: res.status });
  }

  const data: TrackSuggestionResponse = await res.json();
  return NextResponse.json(data);
}
