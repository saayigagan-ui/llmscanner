# 🛡️ CodeSentinel (LLM Scanner)

CodeSentinel is an AI-powered static code analysis tool designed to detect security vulnerabilities, logic flaws, and unsafe coding patterns in source code. By leveraging local LLMs via Ollama, CodeSentinel ensures **100% data privacy**—your code never leaves your local network during analysis.

---

## ✨ Features

- **🔒 Local & Private AI:** Powered by Ollama (`qwen2.5-coder`), keeping all analyzed source code safely on your machine.
- **⚡ Instant Vulnerability Detection:** Identifies flaws like SQL Injection, Remote Command Execution, and unhandled logic errors with line-number precision.
- **💡 Actionable Remediation:** Provides clear explanation logs and secure code rewrites to fix identified risks.
- **💾 Local Persistence:** Stores analysis histories and audit reports locally in a MongoDB database.

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB (Local Community Edition)
- **AI Engine:** Ollama (`qwen2.5-coder:1.5b`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- [Ollama](https://ollama.com/)

---

### 1. Model Setup (Ollama)

Pull and run the local AI coding model:
```bash
ollama run qwen2.5-coder:1.5b
