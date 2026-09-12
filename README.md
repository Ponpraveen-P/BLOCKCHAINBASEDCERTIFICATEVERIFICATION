# 📜 Blockchain-Based Academic Certificate Verification System

An end-to-end, decentralized **Proof-of-Work Blockchain** platform designed to issue, audit, and cryptographically verify academic certificates.

🌐 **Live Frontend Deployment**: [https://ponpraveen-p.github.io/BLOCKCHAINBASEDCERTIFICATEVERIFICATION/](https://ponpraveen-p.github.io/BLOCKCHAINBASEDCERTIFICATEVERIFICATION/)

![CertLedger System](https://img.shields.io/badge/Blockchain-Proof--of--Work-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge)
![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20JSON%20Fallback-brightgreen?style=for-the-badge)


---

## 🚀 Quick Start (Any Operating System)

Works seamlessly on **Windows, macOS, Linux**, and inside **Docker**. No manual database configuration required (automatically falls back to high-performance local JSON DB if MongoDB is not present).

### Option 1: Standard Node.js Execution

```bash
# 1. Clone the repository
git clone https://github.com/Ponpraveen-P/BLOCKCHAINBASEDCERTIFICATEVERIFICATION.git
cd BLOCKCHAINBASEDCERTIFICATEVERIFICATION

# 2. Install all dependencies for root, backend, and frontend
npm run install:all

# 3. Start Backend Server (Port 5000)
npm run start:backend

# 4. In a new terminal tab/window, start Frontend Client (Port 5173)
npm run start:frontend
```

Open **`http://localhost:5173`** in your web browser.

---

### Option 2: 1-Command Docker Setup (Cross-Platform)

```bash
docker-compose up --build
```
Access the application at **`http://localhost:5173`**.

---

## 🔑 Pre-Seeded Demo Credentials

The backend automatically mines demo blockchain blocks and populates initial records upon first launch:

| Role | Email | Password / ID |
| :--- | :--- | :--- |
| **Dean / Admin** | `admin@college.edu` | `admin123` |
| **Student 1** | `aarav@college.edu` | `CS-2023-081` |
| **Student 2** | `priya@college.edu` | `CA-2024-042` |
| **Student 3** | `vikram@college.edu` | `EC-2023-119` |

---

## 🌐 Cloud Deployment Instructions

### 1. Deploy Frontend (Vercel / Netlify)
1. Push this repository to your GitHub account.
2. Connect your repo on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.

### 2. Deploy Backend (Render / Railway)
1. Connect repo on [Render](https://render.com).
2. Use Web Service with **Root Directory** `backend`.
3. Set **Start Command** to `npm start`.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, Lucide Icons, Recharts, Three.js / React Three Fiber.
- **Backend**: Node.js, Express, JSONWebToken, BcryptJS, PDFKit, QRCode, Multer.
- **Blockchain**: In-memory / persistent SHA-256 Proof-of-Work Ledger.
- **Database**: Dual-mode MongoDB Driver + Local JSON File Storage Fallback.

---

## 📄 License
Distributed under the MIT License.
