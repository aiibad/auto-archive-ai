# 📄 Auto-Archive: AI-Powered Smart Vault

**Auto-Archive** is a full-stack document intelligence platform that transforms disorganized files into a structured, searchable digital vault. By leveraging LLMs (Large Language Models), the application automatically classifies, summarizes, and extracts metadata from user-uploaded images and PDFs.

[Live Demo](https://auto-archive-70mi2k49q-ibad-rehmans-projects.vercel.app?_vercel_share=IIGnv7hwhJDFjwg0C0P41Z1N2Y9xtb00) | [System Architecture](#system-architecture) | [Installation](#installation)

---

## 🚀 The Problem
Digital clutter makes finding specific information in receipts, notes, and IDs time-consuming. **Auto-Archive** automates the manual work of organizing files, using an AI-first approach to ensure data is categorized the moment it hits the server.

## 🏗️ System Architecture

The application utilizes a **Serverless-First** approach to ensure scalability and low maintenance:

1. **File Ingestion:** Files are securely uploaded via a dedicated API to cloud storage.
2. **AI Pipeline:** A Next.js **Server Action** triggers an asynchronous call to the GPT-4o model to analyze the file content.
3. **Persistence:** Extracted metadata (category, summary, key entities) is saved to a PostgreSQL database.
4. **Instant Updates:** The UI is updated via `revalidatePath`, providing a seamless "zero-refresh" user experience.



---

## 🛠️ Tech Stack & Technical Decisions

- **Framework:** **Next.js 15 (App Router)** - Chosen for React Server Components (RSC) to minimize client-side JavaScript bundle sizes.
- **Language:** **TypeScript** - Implemented for end-to-end type safety from the database schema to the UI components.
- **Database:** **PostgreSQL (via Neon)** - A relational model was selected over NoSQL to handle complex metadata relationships and ensure ACID compliance.
- **ORM:** **Prisma** - Utilized for type-safe database migrations and high-level abstraction of SQL queries.
- **AI Engine:** **OpenAI GPT-4o** - Integrated for high-accuracy vision analysis and semantic summarization.
- **Styling:** **Tailwind CSS + Shadcn UI** - For a maintainable, design-system-driven interface.

---

## ✨ Key Features

* **🔍 Semantic Search:** Find documents based on their content and AI summaries rather than just filenames.
* **🏷️ Auto-Categorization:** Intelligent detection of document types (e.g., "Medical," "Financial," "Personal").
* **📱 Mobile-First Design:** Fully responsive dashboard allowing users to archive documents via smartphone camera.
* **🔒 Secure Vault:** User-specific data isolation ensuring users only access their uploaded documents.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+ 
- A Neon.tech (PostgreSQL) account
- An OpenAI API Key

### Setup Steps

1. **Clone the Project:**
   ```bash
   git clone [https://github.com/your-username/auto-archive.git](https://github.com/your-username/auto-archive.git)
   cd auto-archive
