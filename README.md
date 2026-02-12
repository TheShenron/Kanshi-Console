# Kanshi Console — Dashboard

**Kanshi Console** is the frontend dashboard for the Kanshi ecosystem.

It provides examiners and admins with a clean interface to review proctoring sessions, candidate activity, and event logs collected from the Kanshi extension — powered by Kanshi Core.

Simple. Fast. Audit-friendly.

---

## ✨ What Kanshi Console Does

Kanshi Console is built for review and clarity.

It allows you to:

- 👤 Manage users and roles (admin / examiner / candidate)
- 🧾 View assessment sessions
- 🔎 Inspect detailed proctoring logs
- 👁️ Track focus changes, clipboard usage, and shortcut activity
- 📊 Monitor candidate behavior patterns over time
- 📥 Export logs for reporting (optional)

---

## ⚔️ Features

- 🧭 Clean examiner-friendly dashboard UI
- 📋 Session list + candidate profiles
- 🔍 Detailed log viewer with timestamps
- 👁️ Focus-loss + tab-switch tracking visualization
- 📋 Clipboard and shortcut event review
- 🔐 Secure access via Kanshi Core authentication
- 📦 Built to scale with more analytics in the future

---

## 🧩 Requirements

> Update these based on your stack.

- Node.js 18+ (recommended)
- React.js @latest
- Kanshi Core running and accessible

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000
