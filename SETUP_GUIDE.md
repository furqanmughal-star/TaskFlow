# TaskFlow — Setup Guide (Roman Urdu)

Is project se aap ko yeh sab milta hai:

| Cheez | Kya hai |
|---|---|
| **Landing page** (`landing/`) | Aapka share karne wala link. Is par app ki info, steps aur **Download / Install** buttons hain. |
| **Windows `.exe`** | Link se download, double-click, install. |
| **Android `.apk`** | Link se download, install. |
| **iPhone / koi bhi browser** | Web app → "Add to Home Screen" / "Install" (PWA). |
| **Cloud database (Supabase)** | Phone aur laptop ke tasks sync. Optional hai — bina iske app offline chalti hai. |

Link kaise kaam karta hai: aap ek link share karte hain (`https://AAPKA-USERNAME.github.io/REPO-NAAM/`). Us par page khulta hai, aur wahan se banda `.exe` ya `.apk` download karta hai. GitHub free hai aur `.exe`/`.apk` khud build kar deta hai (Actions).

---

## Step 1 — Cloud database (Supabase) — 5 minute

1. https://supabase.com par free account banayein → **New project** (koi bhi naam, region aapke qareeb, ek password).
2. Project ready hone par **SQL Editor → New query** kholein, `supabase/schema.sql` ka poora content paste karein aur **Run** dabayein.
3. **Authentication → Providers → Email**: aasani ke liye **"Confirm email"** band kar dein (warna har naye user ko email confirm karni paray gi).
4. **Project Settings → API**: do cheezein copy karein:
   - **Project URL**
   - **anon public key** (yeh public hoti hai, safe hai — data ko `schema.sql` ki Row Level Security protect karti hai)

## Step 2 — Laptop par test

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# .env kholein aur Step 1 wali URL aur key paste karein
npm run dev               # http://localhost:3000
```

App mein upar **Sign in** (☁) button aayega. Account banayein, task add karein, doosre browser/phone par usi account se login karein — tasks sync honge.

## Step 3 — GitHub par daalein (link banane ke liye)

1. https://github.com par **New repository** banayein (Public rakhein taake free Pages + Releases chalein). Naam maslan `taskflow`.
2. Project folder mein:
   ```bash
   git init
   git add .
   git commit -m "TaskFlow"
   git branch -M main
   git remote add origin https://github.com/AAPKA-USERNAME/taskflow.git
   git push -u origin main
   ```
3. Repo → **Settings → Secrets and variables → Actions → New repository secret**. Do secrets banayein:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
4. Repo → **Settings → Pages → Source: GitHub Actions**.
5. **Actions** tab mein "Deploy website" chalne dein (1–2 min). Phir aapka link ban jata hai:
   `https://AAPKA-USERNAME.github.io/taskflow/`

## Step 4 — `.exe` aur `.apk` banwana

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Actions** tab mein "Build installers" chalega (10–15 min). Khatam hone par repo ke **Releases** mein `TaskFlow-Setup.exe` aur `TaskFlow.apk` aa jayengi, aur landing page ke buttons unhi ko download karwate hain. Bas ab link share kar dein.

Naya version: code badlein → `git push` → naya tag (`v1.0.1`) push karein.

## Step 5 — Install karne ka tareeqa (jin ko link bhejna hai)

- **Windows**: link kholein → *Download for Windows* → `TaskFlow-Setup.exe` double-click. Agar "Windows protected your PC" aaye: **More info → Run anyway**.
- **Android**: link Chrome mein kholein → *Download for Android* → file kholein → "Install unknown apps" allow karein → Install.
- **iPhone**: link Safari mein kholein → *Open TaskFlow* → **Share → Add to Home Screen**. (Apple link se app file install nahi karne deta.)
- **Laptop/Android bina download ke**: *Open TaskFlow* → address bar ka install icon ⊕ ya app ka **Install app** button.

## Zaroori baatein (sach batayein to)

- **Security warning normal hai.** `.exe` aur `.apk` kisi paid certificate se sign nahi hain, is liye Windows SmartScreen / Play Protect "unknown app" warning dikhate hain. Aap ke bhai ki `.exe` mein bhi yehi hota hai. Warning hatane ke liye Windows code-signing certificate (~paid) chahiye.
- **APK update**: `.apk` debug key se sign hoti hai jo har build par badal sakti hai. Naya version install karne se pehle purana uninstall karna par sakta hai (cloud account hai to tasks wapas sync ho jate hain). Permanent solution: apni release keystore se signing.
- **Bina GitHub ke** sirf Windows `.exe` laptop se bana sakte hain: `npm install` phir `npm run build:win` → `release/TaskFlow-Setup.exe` ban jati hai, aur aap use WhatsApp/Drive se bhej sakte hain. APK ke liye Android Studio chahiye, is liye GitHub wala tareeqa asaan hai.
- **Sync ka rule**: har task ka sab se naya change jeetta hai (last-write-wins). Offline kaam karein to online aate hi sync ho jata hai.
- Sign out par tasks us device se hat jate hain (cloud mein mehfooz rehte hain), taake shared device par doosra banda aap ke tasks na dekhe.
- Supabase free plan ka project kuch hafte inactive rahe to pause ho sakta hai; dashboard se "Restore" kar dein.
