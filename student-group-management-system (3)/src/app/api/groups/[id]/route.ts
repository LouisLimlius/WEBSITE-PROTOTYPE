import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isDosenRequest, jsonError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!isDosenRequest(req)) return jsonError("Khusus komting.", 403);
  const { id } = await ctx.params;
  await db.delete(groups).where(eq(groups.id, id));
  return NextResponse.json({ ok: true });
}
