# مكتبة التعليم PDF — نشر سريع على Vercel + Supabase

## المتطلبات
- حساب Vercel
- حساب Supabase

## الإعداد
1) في Supabase:
   - أنشئ مشروعًا جديدًا.
   - افتح SQL Editor ونفّذ محتوى `sql/schema.sql` لإنشاء جدول الكتب.
   - من Storage أنشئ Bucket باسم `books` واجعله `public`.
   - من Project Settings -> API خذ `Project URL` و`anon` و`service_role`.

2) انسخ الملف `.env.example` إلى `.env.local` واملأ القيم:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`
   - `SESSION_SECRET` قيمة عشوائية طويلة
   - `ADMIN_PASSWORD_HASH`: نفّذ في طرفيتك:
     ```bash
     echo -n 'YourStrongPasswordHere' | openssl dgst -sha256 | awk '{print $2}'
     ```

3) محليًا:
   ```bash
   npm i
   npm run dev
   ```

4) النشر على Vercel:
   - ارفع المجلد إلى GitHub أو اختر Import Project من Vercel.
   - أضف نفس متغيّرات البيئة في إعدادات Vercel للمشروع.
   - انشر. ستحصل على رابط مثل: https://your-app.vercel.app

## الاستخدام
- افتح الموقع، ابحث وحدّد المراحل/المجالات/المستوى.
- اضغط "دخول المشرف"، أدخل كلمة السر (المطابقة لـ ADMIN_PASSWORD_HASH).
- ارفع PDF من واجهة "رفع كتاب".
- الحذف متاح للمشرف فقط.


## إدارة القوائم ديناميكيًا (مراحل/مجالات/مستويات)
بعد تشغيل الموقع وتسجيل الدخول كمشرف، افتح قسم **"إدارة القوائم (مشرف)"** لإضافة:
- **مرحلة**: (id، الاسم، المدى، الصفوف كوَنها قائمة مفصولة بفواصل مثل `1,2,3`)

- **مجال**: (id، الاسم)

- **مستوى**: (id، الاسم)

ثم استخدم القوائم الجديدة مباشرة في الواجهة.

يمكنك الحذف عبر استدعاء:

- `DELETE /api/stages?id=stage1`

- `DELETE /api/categories?id=religion`

- `DELETE /api/levels?id=beginner`

لاحقًا يمكنك إضافة أزرار حذف/تعديل من الواجهة بسهولة.

