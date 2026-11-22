import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb, hasDatabase } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json({ status: "degraded", db: "not configured" }, { status: 503 });
  }

  try {
    await connectDb();
    await mongoose.connection.db.admin().ping();
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch {
    return NextResponse.json({ status: "degraded", db: "unreachable" }, { status: 503 });
  }
}
