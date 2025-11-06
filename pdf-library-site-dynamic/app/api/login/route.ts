import { NextRequest, NextResponse } from 'next/server';
import { setAuthed, sha256Hex } from '../utils';

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  const password = data?.password || '';
  const hash = sha256Hex(password);
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ ok:false, error: 'ADMIN_PASSWORD_HASH not set' }, { status: 500 });
  }
  if (hash === process.env.ADMIN_PASSWORD_HASH) {
    setAuthed();
    return NextResponse.json({ ok:true });
  }
  return NextResponse.json({ ok:false, error: 'Invalid password' }, { status: 401 });
}
