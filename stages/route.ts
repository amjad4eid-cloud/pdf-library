import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthed } from '../utils';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('stages').select('*').order('id');
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(()=>null);
  if (!body?.id || !body?.name || !body?.range || !Array.isArray(body?.grades)) {
    return NextResponse.json({ ok:false, error:'id, name, range, grades[] required' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('stages').insert({
    id: String(body.id), name: String(body.name), range: String(body.range), grades: body.grades.map((n:number)=>Number(n))
  });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ ok:false, error:'id required' }, { status: 400 });
  const { error } = await supabaseAdmin.from('stages').delete().eq('id', id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}
