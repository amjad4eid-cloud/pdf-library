import { NextResponse } from 'next/server';
import { clearAuth } from '../utils';

export async function POST() {
  clearAuth();
  return NextResponse.json({ ok:true });
}
