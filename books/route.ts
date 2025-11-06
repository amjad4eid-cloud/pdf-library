import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthed } from '../utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get('stage');
  const category = searchParams.get('category');
  const level = searchParams.get('level');
  const q = searchParams.get('q');

  let query = supabaseAdmin.from('books').select('*').order('id', { ascending: false });

  if (stage) query = query.eq('stage', stage);
  if (category) query = query.eq('category', category);
  if (level) query = query.eq('level', level);
  if (q) query = query.ilike('title', f'%{q}%');

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok:false, error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ ok:false, error:'id required' }, { status: 400 });

  // Also delete from storage if we have path
  const { data: row, error: e1 } = await supabaseAdmin.from('books').select('*').eq('id', id).single();
  if (e1) return NextResponse.json({ ok:false, error: e1.message }, { status: 500 });

  if (row?.storage_path) {
    await supabaseAdmin.storage.from('books').remove([row.storage_path]);
  }

  const { error } = await supabaseAdmin.from('books').delete().eq('id', id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}
