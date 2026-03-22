import { NextResponse } from "next/server";
import { getAllHymns } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
    const hymns = getAllHymns();
    return NextResponse.json(hymns);
}