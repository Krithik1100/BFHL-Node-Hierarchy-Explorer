# BFHL — SRM Full Stack Engineering Challenge

## Project Structure
```
bfhl-project/
├── server/
│   ├── index.js       ← Express API  (POST /bfhl)
│   └── package.json
└── frontend/
    └── index.html     ← Single-page frontend
```

---

## ✅ Setup

### 1. Fill in your identity (REQUIRED)

Open `server/index.js` and edit lines 7–9:

```js
const USER_ID             = 'yourname_ddmmyyyy';      // e.g. johndoe_17091999
const EMAIL_ID            = 'your.email@college.edu'; // your college email
const COLLEGE_ROLL_NUMBER = 'XXCS0000';               // your roll number
```

---

### 2. Run the API locally

```bash
cd server
npm install
npm start          # runs on http://localhost:3001
```

---

### 3. Open the frontend

Just open `frontend/index.html` in your browser (double-click or use Live Server).

Set the **API Base URL** field to `http://localhost:3001`.

---

## 🚀 Deploying

### API → Render / Railway / Fly.io

1. Push `server/` to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set **Start Command** to `npm start`
4. Deploy — note the public URL (e.g. `https://bfhl-api.onrender.com`)

### Frontend → Netlify / Vercel / GitHub Pages

1. Push `frontend/` to GitHub
2. Deploy as a static site
3. In the deployed frontend, set API Base URL to your Render URL

---

## API Reference

**POST `/bfhl`**

```json
{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X", "hello", "1->2"]
}
```

Valid edge format: single uppercase letter `->` single uppercase letter.

---

## Features implemented

- ✅ Valid node format validation (regex `^[A-Z]->[A-Z]$`)
- ✅ Self-loop detection (`A->A` → invalid)
- ✅ Whitespace trimming before validation
- ✅ Duplicate edge detection (first occurrence kept, rest in `duplicate_edges` once)
- ✅ Multi-root forest support
- ✅ Diamond/multi-parent: first-encountered parent wins
- ✅ Cycle detection (DFS, directed)
- ✅ Pure cycle: lexicographically smallest node as root
- ✅ Depth calculation (longest root-to-leaf node count)
- ✅ Summary: total_trees, total_cycles, largest_tree_root (with lex tiebreak)
- ✅ CORS enabled
- ✅ Responds in < 3s for 50 nodes
