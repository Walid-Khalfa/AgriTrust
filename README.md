# 🌾 AgriTrust
**Hackathon Track:** Track 4 – AI & DePIN  
**Tagline:** AI-Powered Traceability on Hedera

AgriTrust fights food fraud in Africa by pairing Hedera’s immutable ledger with Gemini AI for real-time auditing.

---

## 🚀 Demo & Submission Links (For Judges)

* **Demo Video (3 min):** `https://youtu.be/nHIcXb2UoRc`
* **Pitch Deck (PDF):** `https://drive.google.com/file/d/1ZqD_QokoZp98BuwXufHs-qSDUeBNmgOU/view?usp=sharing`
---

## 1. Project Description

### [cite_start]The Problem [cite: 20]
Food fraud and missing traceability drain billions from Africa’s agricultural sector. Farmers cannot prove premium quality (e.g., organic), and buyers cannot verify authenticity, hurting trust and revenue.

### [cite_start]Our Hedera-Based Solution [cite: 21]
AgriTrust creates a digital twin (NFT) for every batch, audited by AI and anchored to Hedera for an immutable trail of evidence.

---

## [cite_start]2. Hedera Integration Summary (Required) [cite: 39]

[cite_start]We chose Hedera because predictable, low fees are the only sustainable option for low-margin African logistics.[cite: 45]

### [cite_start]Hedera Services Utilized

* **Hedera Consensus Service (HCS):** Every “proof” event (planting, harvest, etc.) is submitted via `TopicMessageSubmitTransaction` to our topic ID, producing a low-cost (~$0.0001) immutable audit log.[cite: 41]
* **Hedera Token Service (HTS):** We mint the final certificate as a unique NFT using `TokenCreateTransaction`. [cite_start]HCS transaction IDs are embedded in the NFT metadata, binding the asset to its evidence trail.[cite: 44]
* **Mirror Nodes:** The Verify page queries Mirror Nodes (via the SDK) to replay the HCS history and demonstrate authenticity to judges and buyers.

### [cite_start]Economic Justification [cite: 45]
Adoption in Africa demands sub-$1 fees per transaction. Hedera’s fixed, negligible HCS pricing lets us log thousands of events for a few dollars, keeping the business model viable.

---

## 3. Key Features

### Traceability (Hedera)
* **HCS Logging:** Capture every lifecycle event on Hedera Consensus Service.
* **HTS Tokenization:** Mint NFT certificates that reference the HCS history.
* **Verification:** Buyers validate authenticity by reading the full Mirror Node history.

### Intelligence (Gemini AI)
* **Audit & Trust Score:** AI reviews the HCS timeline to produce a 0–100 trust score.
* **Bilingual Summaries:** Generates provenance summaries in English and French.
* **Buyer Q&A Chatbot:** Buyers “talk” to the batch history; AI answers with cited HCS transaction IDs.
* **Dashboard Insight:** AI provides real-time business insights that surface on the main dashboard.

---

## [cite_start]4. Architecture Diagram (Required) [cite: 48]

```ascii
[Farmer]
   |
   v
[Frontend (React)] ---- API ----> [Backend (Node.js/Express)]
   |                                    |           |
   |                                    |           v
   |                                    |     [Gemini AI] (Audits & Q&A)
   |                                    |
   |                                    +---- HCS Submit / HTS Mint ----> [Hedera Network]
   |
   |
[Buyer]
   |
   v
[Frontend (React)] ---- API ----> [Backend (Node.js/Express)]
   |                                    |
   |                                    +---- Reads ----> [Hedera Mirror Node]
   |
   +---- Displays proofs <------------+
```

---

## 5. Deployed Hedera IDs (Testnet)
* Operator Account: `0.0.7127337`
* Topic ID (HCS): 0.0.7127691
* Demo Token ID (HTS): 0.0.7170927 (serial #1)

---

## 6. Deployment Instructions (Quick Start)

The project is optimized for fast setup.

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Walid-Khalfa/AgriTrust
   cd AgriTrust
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   ```bash
   cp backend/.env.example backend/.env
   # edit backend/.env and fill:
   # OPERATOR_ID, OPERATOR_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
   ```

4. **Seed the Demo Data**  
   Creates the HCS topic, mints the demo NFT, and populates Supabase.

   ```bash
   cd backend
   node scripts/seedDemo.js
   ```

5. **Run the Application**

   ```bash
   # Terminal 1 (Backend)
   cd backend
   pnpm run dev

   # Terminal 2 (Frontend)
   cd ..
   pnpm run dev
   ```

   Visit `http://localhost:5173`.

---

## 7. Tech Stack
* Frontend: React (Vite), TypeScript, Tailwind CSS  
* Backend: Node.js, Express  
* Database: Supabase (PostgreSQL)  
* Blockchain: Hedera Hashgraph SDK (`@hashgraph/sdk`)  
* AI: Google Gemini (`@google/generative-ai`)

---

## 8. Links & Compliance
* Hedera Certification: `https://drive.google.com/file/d/1BCe5dCe0eY0qNN4dcBqjqoFJS1XN92n4/view?usp=sharing`
* GitHub Repository: `https://github.com/Walid-Khalfa/AgriTrust`
* Security: No private keys (OPERATOR_KEY, GEMINI_API_KEY) are committed. All secrets load via `process.env` on the backend only.
