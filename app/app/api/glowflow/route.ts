import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { stackServerApp } from "@/stack";

async function ensureSchema() {
  await sql`create table if not exists glowflow_products (
    id text primary key,
    user_email text not null,
    data jsonb not null,
    updated_at timestamptz default now()
  );`;
  await sql`create index if not exists idx_gf_email on glowflow_products (user_email);`;
}

export async function GET(req: NextRequest) {
  await ensureSchema();
  const user = await stackServerApp.getUser();
  if (!user?.primaryEmail) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await sql`
    select id, data, updated_at
    from glowflow_products
    where user_email = ${user.primaryEmail}
    order by updated_at desc
  `;
  return NextResponse.json({ products: rows.map((r: any) => r.data) });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const user = await stackServerApp.getUser();
  if (!user?.primaryEmail) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const products = Array.isArray(body?.products) ? body.products : [];
  const now = new Date().toISOString();

  for (const p of products) {
    const id = String(p.id ?? crypto.randomUUID());
    p.id = id;
    await sql`
      insert into glowflow_products (id, user_email, data, updated_at)
      values (${id}, ${user.primaryEmail}, ${sql.json(p)}, ${now})
      on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at
    `;
  }
  return NextResponse.json({ ok: true, count: products.length });
}

export async function DELETE() {
  await ensureSchema();
  const user = await stackServerApp.getUser();
  if (!user?.primaryEmail) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await sql`delete from glowflow_products where user_email = ${user.primaryEmail}`;
  return NextResponse.json({ ok: true });
}
