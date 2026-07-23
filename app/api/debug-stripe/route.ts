import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });
    const text = await res.text();
    return NextResponse.json({ ok: true, status: res.status, body: text.slice(0, 500) });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : undefined,
      cause: err instanceof Error && err.cause ? String(err.cause) : undefined,
    });
  }
}
