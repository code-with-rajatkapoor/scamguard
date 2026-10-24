# 🛡️ ScamGuard — AI Threat & Fraud Detection System

[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://scamguard.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-code--with--rajatkapoor%2Fscamguard-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/code-with-rajatkapoor/scamguard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Built With Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

**ScamGuard** is an intelligent, real-time web platform engineered to detect, analyze, and neutralize digital scams, phishing URLs, malicious communications, and social engineering attempts. Driven by advanced AI evaluation models and heuristic security checks, ScamGuard provides instant threat classification and detailed risk breakdowns to keep users safe online.

---

## 🌟 Key Features

* **🤖 AI Contextual Scam Analysis:** Analyzes raw text, emails, SMS, financial solicitations, and WhatsApp messages for phishing indicators, urgent urgency tone, impersonation, and fraudulent logic.
* **🔗 Phishing URL & Domain Inspector:** Inspects URLs for suspicious domain variations, SSL certificate validation, malicious redirect chains, and URL shortener expansions.
* **📊 Risk Score & Confidence Index:** Generates a unified safety score (0–100%) accompanied by color-coded threat levels (*Safe*, *Caution*, *Critical Scam*).
* **💡 Actionable Mitigation Advice:** Provides clear, immediate instructions on what to do if targeted (e.g., reporting channels, block procedures, account recovery steps).
* **⚡ High-Performance Edge Runtime:** Fully optimized serverless architecture deployed on Vercel for fast response times and low latency worldwide.
* **📱 Responsive Cyberpunk UI:** Clean, dark-mode accessible interface tailored for desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack & Architecture

### **Frontend & Framework**
* **Framework:** [Next.js](https://nextjs.org/) (React 18 / App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with Lucide React Icons
* **State Management:** React Hooks & Context API

### **Backend & Security Intelligence**
* **Runtime:** Node.js / Vercel Serverless Functions
* **AI Analysis Engine:** OpenAI / Gemini API Integration
* **Threat Feeds:** Domain lookup APIs & Heuristic pattern matching engine

🚀 Getting Started
Follow these steps to set up and run ScamGuard on your local development machine.
Prerequisites
Node.js: v18.0.0 or higher
npm or yarn / pnpm
Git installed on your machine
1. Clone the Repository
git clone [https://github.com/code-with-rajatkapoor/scamguard.git](https://github.com/code-with-rajatkapoor/scamguard.git)
cd scamguard
2. Install Dependencies
   npm install 
3. Configure Environment Variables
Create a .env.local file in the root directory: 
cp .env.example .env.local

Open .env.local and add your credentials:
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Engine API Keys
AI_API_KEY=your_ai_api_key_here

# Optional Threat Intelligence API Keys
SAFE_BROWSING_API_KEY=your_google_safe_browsing_key

4. Run the Development Server
   npm run dev 

Visit http://localhost:3000 in your browser to test the application locally.
📡 API Reference
Analyze Threat
Analyzes text, message content, or web URLs for fraud indicators.
Endpoint: POST /api/analyze
Content-Type: application/json

Request Body
{
  "type": "text", 
  "content": "URGENT: Your bank account has been suspended! Click here immediately to restore access: [http://bank-secure-login-verify.com](http://bank-secure-login-verify.com)"
}

Response Structure
{
  "status": "success",
  "data": {
    "riskLevel": "CRITICAL",
    "riskScore": 92,
    "verdict": "Likely Phishing / Bank Impersonation Scam",
    "indicators": [
      "Urgency tactics detected in text",
      "Suspicious domain mismatch (bank-secure-login-verify.com)",
      "Unverified financial solicitation"
    ],
    "recommendedActions": [
      "Do not click on any links in the message",
      "Contact your bank directly using their official website or phone number",
      "Report the phone number/email address to fraud prevention authorities"
    ]
  }
}


☁️ Deployment
ScamGuard is optimized for one-click deployment on Vercel:
Fork or push your project to GitHub.
Go to the Vercel Dashboard and click "Add New Project".
Import the repository code-with-rajatkapoor/scamguard.
In Environment Variables, add AI_API_KEY and any associated keys.
Click Deploy.

🔒 Privacy & Safety Statement
ScamGuard does not store or share personal user credentials, submitted messages, or sensitive information.
All checks are performed statelessly in secure serverless functions.
Never input passwords, pin numbers, or sensitive financial data into scanner inputs.

🤝 Contributing
Contributions are always welcome! To contribute:
Fork the repository.
Create your feature branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.

👨‍💻 Author & Maintainer
Rajat Kapoor
GitHub: @code-with-rajatkapoor
Live Application: ScamGuard Web App

📜 License
This project is open-source under the MIT License.