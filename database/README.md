# 🗄️ Supabase Database Update Guide

## Adding Arabic Translations to Rooms

This guide will walk you through adding Arabic translation support to your Trapped Egypt rooms.

---

## 📋 Step-by-Step Instructions

### Step 1: Access Supabase SQL Editor

1. **Go to your Supabase Dashboard**
   - Open your browser and navigate to: https://supabase.com/dashboard
   - Log in with your Supabase account

2. **Select your project**
   - Click on your Trapped Egypt project (the one with URL: `dqggwdkhhffvxpvclnzx.supabase.co`)

3. **Open the SQL Editor**
   - In the left sidebar, click on **"SQL Editor"** (looks like a document with code)
   - You'll see a blank editor where you can run SQL queries

---

### Step 2: Add Arabic Columns to Rooms Table

1. **Create a new query**
   - Click **"+ New query"** button

2. **Copy and paste this SQL script:**

```sql
-- Add Arabic translation columns
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tagline_ar TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND column_name IN ('name_ar', 'tagline_ar', 'description_ar');
```

3. **Run the query**
   - Click the green **"Run"** button (or press Cmd+Enter on Mac)
   - You should see a success message and a table showing the 3 new columns

---

### Step 3: Insert Arabic Translations

1. **Create a new query**
   - Click **"+ New query"** again

2. **Copy and paste this SQL script:**

```sql
-- Bunker 38
UPDATE rooms SET 
    name_ar = 'مخبأ 38',
    tagline_ar = 'القصة النووية',
    description_ar = 'تخيّل أنك محتجز في مخبأ تحت الأرض بعد كارثة نووية مروعة. الأكسجين ينفد ببطء، والوقت ليس في صالحك. هل تستطيع إيجاد طريقة للخروج قبل أن ينفد الهواء؟'
WHERE slug = 'bunker-38';

-- Cell Block C
UPDATE rooms SET 
    name_ar = 'الزنزانة C',
    tagline_ar = 'الإدانة الخاطئة',
    description_ar = 'أنت وأصدقاؤك أُدنتم ظلماً بجريمة إرهابية في بلد أجنبي. الجريمة نفذها الإرهابي الدولي "داني باد"، لكن عليك أن تهرب لإثبات براءتك! أنت الآن محتجز في سجن "الزنزانة C" - أشد السجون أمناً والمخصص لأخطر المجرمين. هل تستطيع التغلب على النظام وتبرئة اسمك قبل فوات الأوان؟'
WHERE slug = 'cell-block-c';

-- Detonation
UPDATE rooms SET 
    name_ar = 'التفجير',
    tagline_ar = 'لست مستعداً للانفجار',
    description_ar = 'بعد عام كامل من جمع المعلومات عن "داني باد"، المجرم الخطير المطلوب من عدة دول، حصلت أخيراً على أفضل دليل لموقعه. لكن احذر! يشتهر "باد" بتفجير كل من يحاول تعقبه. هل تستطيع إبطال القنبلة والهروب قبل أن تنفجر بك؟'
WHERE slug = 'detonation';

-- Namrood
UPDATE rooms SET 
    name_ar = 'النمرود',
    tagline_ar = 'علينا أن نتحد معاً',
    description_ar = 'النمرود! أعظم ساحر في العصور الوسطى، تجسيد الشر المطلق على الأرض، وملك السحر الأسود. فضولك أوصلك إلى عتبة داره، والدخول سهل لكن الخروج لن يكون كذلك! عليك إما الهروب وإيجاد التعويذة التي ستحررك من هذا المنزل وتنقذك من السحر الأسود... أو ستكون آخر ليلة ترى فيها النور!'
WHERE slug = 'namrood';

-- Quarantined
UPDATE rooms SET 
    name_ar = 'الحجر الصحي',
    tagline_ar = 'ليس مرة أخرى',
    description_ar = 'أنت محاصر في منطقة حجر صحي ممتلئة بالزومبي بسبب تفشي فيروس خطير. هدفك: الهروب قبل أن تُصاب بالعدوى وتصبح واحداً منهم!'
WHERE slug = 'quarantined';

-- Sacrifice
UPDATE rooms SET 
    name_ar = 'التضحية',
    tagline_ar = 'اسمع صراخهم.. لكن استمر',
    description_ar = 'تم اختطافك أنت وأصدقاؤك وتقسيمكم إلى غرفتين منفصلتين. تستطيعون رؤية وسماع بعضكم لكن لا تستطيعون الوصول لبعض. للهرب، عليكم حل الألغاز في كل غرفة والاجتماع مجدداً قبل نفاد الوقت. هل تستطيعون التغلب على خاطفيكم وإعادة توحيد المجموعة؟'
WHERE slug = 'sacrifice';

-- Dungeon Of Doom
UPDATE rooms SET 
    name_ar = 'زنزانة الهلاك',
    tagline_ar = 'أسرع! شيء ما قادم!',
    description_ar = 'صديقك اتُهم ظلماً بالقتل وحُكم عليه بالإعدام. إنه محتجز في زنزانة قرون وسطى، وأنت مهمتك اقتحامها وإنقاذه. هل تستطيع تحرير صديقك والهروب من الزنزانة قبل عودة الحراس؟ لديك 60 دقيقة فقط، وإلا ستواجه نفس المصير!'
WHERE slug = 'dungeon-of-doom';

-- The Experiments
UPDATE rooms SET 
    name_ar = 'التجارب',
    tagline_ar = 'الصرخة القادمة ستكون صرختك',
    description_ar = 'أنت محتجز في وكر طبيبة نفسية مهووسة بإجراء اختبارات أدوية باستخدام أجزاء جسم الإنسان. مهمتك واضحة: الهروب قبل أن تصبح تجربتها المرعبة القادمة. هل تستطيع الإفلات قبل فوات الأوان؟'
WHERE slug = 'the-experiments';

-- Vault
UPDATE rooms SET 
    name_ar = 'الخزنة',
    tagline_ar = 'ليست سرقة إذا كانت ملكك',
    description_ar = 'اتخذت قراراً جريئاً باقتحام خزنة بنك فاخر لاستعادة أموالك التي سرقها منك كازينو محتال. الآن، محاطاً بأمن مشدد، مهمتك هي استرداد أموالك بسرعة قبل وصول رجال الشرطة!'
WHERE slug = 'vault';
```

3. **Run the query**
   - Click the green **"Run"** button
   - You should see "Success. X rows affected" for each UPDATE statement

---

### Step 4: Verify the Translations

1. **Run this query to check your work:**

```sql
SELECT slug, name, name_ar, tagline_ar 
FROM rooms 
ORDER BY name;
```

2. **You should see a table with all rooms showing both English and Arabic content**

---

### Step 5 (Optional): Fix Promo Codes Table

If you want the promo codes to have proper timestamps, run this:

```sql
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
---

### Step 6: Create Event Leads Table (REQUIRED for Special Events)

**⚠️ IMPORTANT:** This step is required for the special events forms (Birthdays, Corporate, School Trips) to work!

1. **Create a new query**
   - Click **"+ New query"** again

2. **Copy and paste this SQL script:**

```sql
-- Create the event_leads table for special event inquiries
CREATE TABLE IF NOT EXISTS event_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    branch TEXT DEFAULT 'New Cairo',
    status TEXT DEFAULT 'New',
    preferred_date DATE,
    preferred_time TEXT,
    group_size TEXT,
    form_payload JSONB DEFAULT '{}',
    internal_notes TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    utm_medium TEXT,
    utm_content TEXT,
    fbclid TEXT,
    event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_leads_event_type ON event_leads(event_type);
CREATE INDEX IF NOT EXISTS idx_event_leads_status ON event_leads(status);
CREATE INDEX IF NOT EXISTS idx_event_leads_created_at ON event_leads(created_at DESC);

-- Enable RLS and set policies
ALTER TABLE event_leads ENABLE ROW LEVEL SECURITY;

-- Allow website visitors to submit leads
CREATE POLICY "Allow public insert for event leads"
    ON event_leads FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow admin to view leads
CREATE POLICY "Allow authenticated select for event leads"
    ON event_leads FOR SELECT TO authenticated
    USING (true);

-- Allow admin to update leads
CREATE POLICY "Allow authenticated update for event leads"
    ON event_leads FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);
```

3. **Run the query**
   - Click the green **"Run"** button
   - You should see a success message

4. **Test the table** (optional):
```sql
-- Verify table exists
SELECT * FROM event_leads LIMIT 5;
```

---

## ✅ That's It!

After running these scripts, your website will automatically:
- Show Arabic room names, taglines, and descriptions when the site is in Arabic mode
- Fall back to English content if Arabic translations are missing

**To test:**
1. Go to your website
2. Switch to Arabic using the language switcher
3. Navigate to the Rooms page and click on any room
4. You should see the Arabic room story/description!

---

## 🔧 Troubleshooting

### "Column already exists" error
This is fine! It means the column was already added. Continue to the next step.

### "No rows affected" 
Check that the `slug` values in the SQL match your actual room slugs. Run:
```sql
SELECT slug FROM rooms;
```
And compare with the slugs in the UPDATE statements.

### Arabic text not showing on website
1. Make sure you ran BOTH scripts (Step 2 AND Step 3)
2. Hard refresh your browser (Cmd+Shift+R on Mac)
3. Check the browser console for any errors

---

## 📝 Editing Translations Later

You can edit any translation directly in Supabase:
1. Go to **Table Editor** (in left sidebar)
2. Click on the **rooms** table
3. Find the room you want to edit
4. Click on the cell and edit the Arabic text
5. Press Enter to save
