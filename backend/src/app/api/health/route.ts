import { NextResponse } from "next/server";
import { handleOptions, withCors } from "@/lib/cors";

export async function GET() {
  return withCors(NextResponse.json({ status: "ok" }));
}

export async function OPTIONS() {
  return handleOptions();
}
