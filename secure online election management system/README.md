<div align="center">
  <img src="public/favicon.svg" alt="SecureVote Logo" width="100" />
  <h1>SecureVote - Online Election Management System</h1>
  <p>A production-grade, secure, and scalable platform for organizations to run verified democratic processes online.</p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-Backend-green.svg?style=flat&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </p>
</div>

---

## 📖 About The Project

**SecureVote** provides a complete end-to-end solution for conducting transparent and secure elections. Built with modern web technologies, it ensures voter anonymity while providing administrators with powerful tools to manage the entire election lifecycle.

*(Tip: Add a screenshot of your dashboard or landing page here before publishing)*
<!-- ![Dashboard Screenshot](./docs/dashboard-preview.png) -->

## ✨ Key Features

*   🔐 **Role-Based Access Control:** Distinct workflows for Super Admins, Election Creators, and Voters.
*   🗳️ **Anonymous & Secure Voting:** Votes are stored without user identifiable information using edge functions.
*   📊 **Real-time Analytics:** Live dashboards and Recharts for monitoring election progress securely.
*   📝 **Multi-Step Election Builder:** Draft, configure, and publish elections seamlessly.
*   📜 **Comprehensive Audit Logs:** Exportable logs and a full action trail for ultimate transparency.
*   🎨 **Premium UI/UX:** Responsive design, dark/light modes, glassmorphism, and Framer Motion animations.
*   🛡️ **Advanced Security:** CAPTCHA integration, secret voter IDs, and Row Level Security (RLS).
*   🚀 **Demo Mode:** Fully functional UI preview even without a Supabase connection.

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Language** | TypeScript |
| **Styling & UI** | Tailwind CSS v4, shadcn-style Radix components, Framer Motion |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form, Zod |
| **Charts** | Recharts |
| **Backend & Auth** | Supabase (PostgreSQL, RLS, Storage, Realtime) |
| **Serverless** | Supabase Edge Functions |

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A Supabase account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/securevote.git
    cd securevote
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Copy the sample environment file and update it with your credentials:
    ```bash
    cp .env.example .env
    ```

### Backend Setup (Supabase)

1.  Create a new project on [Supabase](https://supabase.com).
2.  Navigate to the **SQL Editor** and run the schema files:
    *   `supabase/migrations/001_initial_schema.sql`
    *   `supabase/migrations/002_vote_rpc.sql` (if applicable)
3.  Set up storage buckets for `candidate-photos` and `election-banners`.
4.  Update your `.env` file with your project URL and ANON KEY:
    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    VITE_APP_URL=http://localhost:5173
    ```

### Running Locally

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173`.
3.  *Note: To test admin features, sign up as a normal user first, then manually update your role in the Supabase `profiles` table to `super_admin`.*

## 📂 Project Structure

```text
securevote/
├── src/
│   ├── components/    # Reusable UI components & layouts
│   ├── pages/         # Application routes (Auth, Dashboard, Elections)
│   ├── lib/           # Utility functions, Supabase client, validations
│   ├── stores/        # Zustand state management
│   └── types/         # TypeScript interfaces and types
├── supabase/
│   ├── migrations/    # Database schema and RLS policies
│   └── functions/     # Edge functions (e.g., cast-vote)
└── package.json       # Project dependencies and scripts
```

## 🔒 Security Practices

*   **Row Level Security (RLS):** All database interactions are strictly governed by Supabase RLS policies.
*   **Anonymity:** Votes are decoupled from user identities to ensure ballot secrecy.
*   **Data Validation:** Strict client and server-side validation using Zod.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/your-username/securevote/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
