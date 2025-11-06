import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthed } from '../utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok:false, error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const title = String(form.get('title') || '');
  const grade = Number(form.get('grade') || 0);
  const category = String(form.get('category') || '');
  const level = String(form.get('level') || '');
  const stage = String(form.get('stage') || '');
  const maxCapacityMB = 10240;

  if (!file) return NextResponse.json({ ok:false, error:'file is required' }, { status: 400 });

  // capacity check
  const { data: sizes, error: e2 } = await supabaseAdmin.from('books').select('sizeMB');
  if (e2) return NextResponse.json({ ok:false, error:e2.message }, { status: 500 });
  const usedMB = (sizes || []).reduce((s: number, r: any) => s + (Number(r.sizeMB) || 0), 0);
  const fileMB = Math.ceil((file.size || 0) / (1024 * 1024));
  if (usedMB + fileMB > maxCapacityMB) {
    return NextResponse.json({ ok:false, error:`Capacity exceeded: ${usedMB + fileMB}MB > ${maxCapacityMB}MB` }, { status: 400 });
  }

  // upload to storage
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const path = `${stage}/${category}/${level}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data: uploaded, error: e1 } = await supabaseAdmin.storage.from('books').upload(path, bytes, {
    contentType: file.type || 'application/pdf',
    upsert: false
  });
  if (e1) return NextResponse.json({ ok:false, error: e1.message }, { status: 500 });

  // get public URL
  const { data: pub } = supabaseAdmin.storage.from('books').getPublicUrl(path);
  const url = pub.publicUrl;

  // insert row
  const { data: inserted, error } = await supabaseAdmin.from('books').insert({
    title, stage, grade, category, level, sizeMB: fileMB, url, storage_path: path
  }).select('*').single();

  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data: inserted });
}
