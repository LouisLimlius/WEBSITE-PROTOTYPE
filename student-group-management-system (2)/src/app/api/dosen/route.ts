import { NextRequest, NextResponse } from "next/server";
import { verifyDosenPin, setDosenCookie, clearDosenCookie, isDosenRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  return NextResponse.json({ dosen: isDosenRequest(req) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pin = typeof body?.pin === "string" ? body.pin : "";
  if (!verifyDosenPin(pin)) {
    return NextResponse.json({ error: "PIN salah. Coba lagi ya." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setDosenCookie(res);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearDosenCookie(res);
  return res;
}
