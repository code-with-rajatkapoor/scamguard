# 🛡️ ScamGuard — AI Threat & Phishing Detection System

[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://scamguard.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-code--with--rajatkapoor%2Fscamguard-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/code-with-rajatkapoor/scamguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**ScamGuard** is an intelligent, real-time web platform engineered to detect, analyze, and neutralize digital scams, phishing URLs, malicious communications, and social engineering attempts. Driven by a pattern-based security engine and optional AI verdict (rate-limited free-tier Gemini), ScamGuard provides instant threat classification and detailed risk breakdowns.

---

## 🌟 Key Features

* **🔍 Pattern-Based Threat Detection** — Scans email, SMS, chat, and financial solicitations for phishing patterns, urgency tactics, credential theft, typosquatted brand domains, and dozens of scam indicators.
* **🧠 AI Verdict (Optional)** — Powered by Google Gemini (free tier). When `GEMINI_API_KEY` is set, the AI analyzes the text and provides a verdict with confidence and reasoning.
* **📊 Risk Score & Confidence Index** — Generates a unified safety score (0–100%) with color-coded threat levels: *Safe*, *Caution*, *Danger*.
* **📱 Multi-language Support** — Supports 17 Indian languages plus English, so the engine catches scams regardless of the input language.
* **📸 Screenshot Scanner** — Upload a screenshot of a suspicious message. OCR extracts text and flags fake, phishing, or scam content.
* **📱 QR Scanner & Upload** — Scan QR codes via camera or upload an image file. Recognize encoded content and flag malicious links.
* **💾 Scan History** — Save scans to Supabase (or use the no-op fallback) for later review.
* **📋 Export Reports** — Export incident reports as PDF or CSV.
* **🎨 Premium Dark/Light Theme** — Toggleable theme with a cyberpunk-dark UI.
* **🧩 Rule-Based Engine (Reliable Primary)** — The rule-based detector is the reliable primary path; the optional AI verdict is a complement, not a dependency.

---

## 🛠️ Tech Stack & Architecture

### **Frontend & Framework**
* **Framework:** Vite + React 18 (TypeScript, App Router style with functional components)
* **Styling:** Tailwind CSS + Custom CSS with Lucide React Icons
* **State Management:** React Hooks & Context API
* **QR Scanning:** `html5-qrcode` (camera + file upload)
* **OCR:** `tesseract.js` (screenshot text extraction)

### **Backend & Security Intelligence**
* **Runtime:** Node.js (Express 5) — `server.js`
* **AI Analysis Engine:** Google Gemini (free tier, `GEMINI_API_KEY` optional)
* **Database:** Supabase (optional — no-op fallback if not configured)
* **Threat Intelligence:** Heuristic pattern matching engine (no external feeds required)

### **Development Scripts**
```bash
npm run dev      # Runs Vite (:5173) + Express (:3000) concurrently via Vite proxy
npm run build    # Type-check, ESLint, Vite build, and tests
npm run typecheck # tsc --noEmit
npm run lint     # eslint .
```

---

## 🔑 Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | No | — | Google Gemini API key. When unset, the app uses rule-based detection only and shows no AI verdict. |
| `GEMINI_MODEL` | No | `gemini-3-flash-preview` | Gemini model to call. |
| `PORT` | No | `3000` | Backend Express server port. |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origins (comma-separated). |
| `VITE_SUPABASE_URL` | No | — | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | No | — | Supabase anon/publishable key. |

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/code-with-rajatkapoor/scamguard.git
   cd scamguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and set your GEMINI_API_KEY if you want AI verdicts
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` in your browser.

---

## 📡 API Reference

### Analyze Threat

Analyzes text, message content, or URLs for fraud indicators.

**Endpoint:** `POST /api/analyze`

**Request Body (JSON):**
```json
{
  "input": "URGENT: Your bank account has been suspended! Click here immediately to restore access: http://bank-secure-login-verify.com",
  "text": "URGENT: Your bank account has been suspended!",
  "message": "URGENT: Your bank account has been suspended!",
  "url": "http://bank-secure-login-verify.com"
}
```

**Response:**
```json
{
  "status": "SCAM",
  "confidence": "high",
  "reason": "The content shows multiple scam indicators including urgency, credential harvesting, and suspicious links."
}
```

### Health Check

**Endpoint:** `GET /health` (also `GET /`)

Returns a service status and health check.

---

## 📄 Incident Report Export

You can export scan results as a PDF report using `downloadIncidentReport()` from `src/lib/exportIncidentReport`. The report includes the overall risk level, detected indicators, domain inspection summary, and actionable safety recommendations.

---

## 🔒 Privacy & Safety Statement

* ScamGuard provides automated analysis and is not a substitute for professional security advice.
* Never input passwords, PINs, or sensitive financial data into scan inputs.
* All analysis is stateless; history is only stored if Supabase is configured.

---

## 🤝 Contributing

Contributions are always welcome! To contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👨‍💻 Author & Maintainer

**Rajat Kapoor**  
GitHub: [@code-with-rajatkapoor](https://github.com/code-with-rajatkapoor)  
Live Application: [ScamGuard Web App](https://scamguard-omega.vercel.app)

📜 **License**

This project is open-source under the MIT License.
