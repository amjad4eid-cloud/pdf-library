'use client';
import React, { useEffect, useMemo, useState } from 'react';

type Stage = { id: string; name: string; range: string; grades: number[] };
type Category = { id: string; name: string };
type Level = { id: string; name: string };
type Book = {
  id: number;
  title: string;
  stage: string;
  grade: number;
  category: string;
  level: string;
  sizeMB: number;
  url: string;
};

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stages, setStages] = useState<Stage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [stage, setStage] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGrade, setNewGrade] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  // Admin settings forms
  const [stgId, setStgId] = useState('stage1');
  const [stgName, setStgName] = useState('المرحلة الأولى');
  const [stgRange, setStgRange] = useState('الصف 1-3');
  const [stgGrades, setStgGrades] = useState('1,2,3');

  const [catId, setCatId] = useState('religion');
  const [catName, setCatName] = useState('مجال ديني');

  const [lvlId, setLvlId] = useState('beginner');
  const [lvlName, setLvlName] = useState('مبتدئ');

  const activeGrades = useMemo(() => {
    if (!stage) return null;
    return stages.find(s => s.id === stage)?.grades ?? null;
  }, [stage, stages]);

  async function fetchSettings() {
    const [s, c, l] = await Promise.all([
      fetch('/api/stages', { cache:'no-store' }).then(r=>r.json()),
      fetch('/api/categories', { cache:'no-store' }).then(r=>r.json()),
      fetch('/api/levels', { cache:'no-store' }).then(r=>r.json()),
    ]);
    if (s.ok) setStages(s.data);
    if (c.ok) setCategories(c.data);
    if (l.ok) setLevels(l.data);
  }

  async function fetchBooks() {
    const sp = new URLSearchParams();
    if (stage) sp.set('stage', stage);
    if (category) sp.set('category', category);
    if (level) sp.set('level', level);
    if (query) sp.set('q', query);
    const res = await fetch('/api/books?' + sp.toString(), { cache: 'no-store' });
    const j = await res.json();
    if (j.ok) setBooks(j.data);
  }

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { fetchBooks(); }, [stage, category, level, query]);

  async function handleLogin() {
    setLoginError('');
    const res = await fetch('/api/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ password }) });
    const j = await res.json();
    if (j.ok) { setAuthed(true); setLoginOpen(false); setPassword(''); }
    else setLoginError(j.error || 'خطأ غير متوقع');
  }
  async function handleLogout() {
    await fetch('/api/logout', { method:'POST' });
    setAuthed(false);
  }

  async function handleUpload() {
    if (!newFile || !newTitle || !newGrade || !newCategory || !newLevel) return alert('أكمل الحقول');
    const form = new FormData();
    form.append('file', newFile);
    form.append('title', newTitle);
    form.append('grade', String(newGrade));
    form.append('category', newCategory);
    form.append('level', newLevel);
    form.append('stage', stages.find(s => s.grades.includes(Number(newGrade)))?.id || '');
    const res = await fetch('/api/upload', { method:'POST', body: form });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'فشل الرفع');
    setUploadOpen(false);
    setNewTitle(''); setNewGrade(null); setNewCategory(null); setNewLevel(null); setNewFile(null);
    fetchBooks();
  }

  const filtered = useMemo(() => {
    return books.filter(b => {
      const okGrade = !activeGrades || activeGrades.includes(b.grade);
      return okGrade;
    });
  }, [books, activeGrades]);

  // Admin: add stage/category/level
  async function addStage() {
    const grades = stgGrades.split(',').map(s=>Number(s.trim())).filter(Boolean);
    const res = await fetch('/api/stages', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: stgId, name: stgName, range: stgRange, grades }) });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'تعذر إضافة المرحلة');
    fetchSettings();
  }
  async function addCategory() {
    const res = await fetch('/api/categories', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: catId, name: catName }) });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'تعذر إضافة المجال');
    fetchSettings();
  }
  async function addLevel() {
    const res = await fetch('/api/levels', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id: lvlId, name: lvlName }) });
    const j = await res.json();
    if (!j.ok) return alert(j.error || 'تعذر إضافة المستوى');
    fetchSettings();
  }

  return (
    <div>
      <header>
        <div className="container">
          <div className="row">
            <div className="flex center" style={{gap:8}}>
              <strong>📚 مكتبة التعليم PDF</strong>
              <span className="badge">سعة كلية: 10GB</span>
            </div>
            <div className="flex center" style={{gap:8}}>
              <input className="input" placeholder="ابحث عن كتاب..." value={query} onChange={e=>setQuery(e.target.value)} style={{width:260}}/>
              {!authed ? (
                <button className="btn" onClick={()=>setLoginOpen(true)}>دخول المشرف</button>
              ) : (
                <div className="flex center" style={{gap:8}}>
                  <span className="badge">مشرف</span>
                  <button className="btn" onClick={()=>setUploadOpen(true)}>رفع كتاب</button>
                  <button className="btn" onClick={handleLogout}>خروج</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {loginOpen && (
        <div className="container">
          <div className="card mt12">
            <h3>تسجيل دخول المشرف</h3>
            <input type="password" className="input mt8" placeholder="أدخل كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} />
            {loginError ? <div className="text-sm" style={{color:'#dc2626'}}>{loginError}</div> : null}
            <div className="mt12"><button className="btn primary" onClick={handleLogin}>دخول</button></div>
          </div>
        </div>
      )}

      {authed && uploadOpen && (
        <div className="container">
          <div className="card mt12">
            <h3>رفع كتاب PDF</h3>
            <input className="input mt8" placeholder="عنوان الكتاب" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
            <div className="grid grid3 mt8">
              <select className="input" onChange={e=>setNewGrade(Number(e.target.value) || null)} value={newGrade || ''}>
                <option value="">الصف</option>
                {Array.from({length:12}, (_,i)=>i+1).map(g=><option key={g} value={g}>الصف {g}</option>)}
              </select>
              <select className="input" onChange={e=>setNewCategory(e.target.value || null)} value={newCategory || ''}>
                <option value="">المجال</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="input" onChange={e=>setNewLevel(e.target.value || null)} value={newLevel || ''}>
                <option value="">المستوى</option>
                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="mt12">
              <input type="file" accept="application/pdf" onChange={e=>setNewFile(e.target.files?.[0] || null)} />
            </div>
            <div className="mt12">
              <button className="btn primary" onClick={handleUpload}>إضافة</button>
              <button className="btn" onClick={()=>setUploadOpen(false)} style={{marginInlineStart:8}}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <main className="container">
        <div className="grid grid2 mt16">
          <div>
            <div className="card">
              <strong>المراحل الدراسية</strong>
              <div className="grid mt12" style={{gap:8}}>
                {stages.map(s => (
                  <button key={s.id} className="btn between" onClick={()=> setStage(stage===s.id? null : s.id)}>
                    <span>{s.name}</span>
                    <span className="text-xs">{s.range}</span>
                  </button>
                ))}
                {stages.length === 0 && <div className="text-xs">لم تتم إضافة مراحل بعد.</div>}
              </div>
            </div>

            {stage && (
              <div className="card mt12">
                <strong>المجالات</strong>
                <div className="grid mt12" style={{gap:8, gridTemplateColumns:'repeat(2, minmax(0, 1fr))'}}>
                  {categories.map(c => (
                    <button key={c.id} className="btn" onClick={()=> setCategory(category===c.id? null : c.id)}>{c.name}</button>
                  ))}
                  {categories.length === 0 && <div className="text-xs">لم تتم إضافة مجالات بعد.</div>}
                </div>
              </div>
            )}

            {stage && category && (
              <div className="card mt12">
                <strong>المستوى</strong>
                <div className="flex wrap mt12">
                  {levels.map(l => (
                    <button key={l.id} className="pill" onClick={()=> setLevel(level===l.id? null : l.id)}>{l.name}</button>
                  ))}
                  {levels.length === 0 && <div className="text-xs">لم تتم إضافة مستويات بعد.</div>}
                </div>
              </div>
            )}

            {authed && (
              <div className="card mt12">
                <strong>إدارة القوائم (مشرف)</strong>
                <div className="grid grid2 mt12">
                  <div className="card">
                    <div><strong>إضافة مرحلة</strong></div>
                    <input className="input mt8" placeholder="id (مثال: stage1)" value={stgId} onChange={e=>setStgId(e.target.value)} />
                    <input className="input mt8" placeholder="الاسم" value={stgName} onChange={e=>setStgName(e.target.value)} />
                    <input className="input mt8" placeholder="المدى (مثال: الصف 1-3)" value={stgRange} onChange={e=>setStgRange(e.target.value)} />
                    <input className="input mt8" placeholder="الصفوف (مثال: 1,2,3)" value={stgGrades} onChange={e=>setStgGrades(e.target.value)} />
                    <button className="btn primary mt8" onClick={addStage}>إضافة مرحلة</button>
                  </div>

                  <div className="card">
                    <div><strong>إضافة مجال</strong></div>
                    <input className="input mt8" placeholder="id (مثال: religion)" value={catId} onChange={e=>setCatId(e.target.value)} />
                    <input className="input mt8" placeholder="الاسم" value={catName} onChange={e=>setCatName(e.target.value)} />
                    <button className="btn primary mt8" onClick={addCategory}>إضافة مجال</button>
                  </div>

                  <div className="card">
                    <div><strong>إضافة مستوى</strong></div>
                    <input className="input mt8" placeholder="id (مثال: beginner)" value={lvlId} onChange={e=>setLvlId(e.target.value)} />
                    <input className="input mt8" placeholder="الاسم" value={lvlName} onChange={e=>setLvlName(e.target.value)} />
                    <button className="btn primary mt8" onClick={addLevel}>إضافة مستوى</button>
                  </div>
                </div>
                <div className="text-xs mt8">* يمكنك لاحقًا إضافة شاشة حذف/تعديل عناصر فردية، أو استخدام DELETE عبر Query param id عند الحاجة.</div>
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <div className="between flex center">
                <strong>قائمة الكتب</strong>
              </div>
              <div className="grid mt12" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
                {filtered.length === 0 ? (
                  <div className="text-xs">لا توجد نتائج مطابقة.</div>
                ) : filtered.map(b => (
                  <div key={b.id} className="card">
                    <div className="between flex center mb8">
                      <span className="badge">الصف {b.grade}</span>
                      <span className="text-xs">{b.sizeMB}MB</span>
                    </div>
                    <div className="mb12"><strong>{b.title}</strong></div>
                    <div className="flex wrap mb12">
                      <span className="pill">{categories.find(c=>c.id===b.category)?.name}</span>
                      <span className="pill">{levels.find(l=>l.id===b.level)?.name}</span>
                    </div>
                    <div className="between flex center">
                      <a className="btn primary" href={b.url} target="_blank" rel="noreferrer">تنزيل</a>
                      {authed && (
                        <button className="btn ghost" onClick={async ()=>{
                          const res = await fetch('/api/books?id='+b.id, { method:'DELETE' });
                          const j = await res.json();
                          if (!j.ok) return alert(j.error || 'فشل الحذف');
                          fetchBooks();
                        }}>حذف</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="container footer">
        <div>© {new Date().getFullYear()} مكتبة التعليم PDF</div>
        <div>منصة بإدارة ديناميكية للقوائم عبر Supabase.</div>
      </div>
    </div>
  );
}
