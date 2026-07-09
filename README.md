# Citly Restaurant Management Platform

A modern, responsive Next.js 16 application tailored for restaurant management, backed by ERPNext. 

This platform provides restaurant owners and staff with a unified dashboard to manage orders, inventory, menus, tables, and staff seamlessly.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- **Node.js** (v18.x or newer)
- **npm** (comes with Node.js) or **pnpm**
- **Git**

## Local Setup Instructions

Follow these steps to get your development environment running:

### 1. Clone or Pull the Repository

Open your terminal and clone the repository (or pull the latest changes if you already have it):

```bash
git clone <your-repository-url>
cd citly/citly-nextjs
```

If you are already inside the repository folder, just ensure you have the latest code:
```bash
git pull origin main
```

### 2. Install Dependencies

Install all required packages using npm or pnpm:

```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Create a new file named `.env.local` in the root of the `citly-nextjs` directory and add the following required environment variables to connect to the ERPNext backend:

```env
# ERPNext Backend URL
NEXT_PUBLIC_ERPNEXT_URL=http://104.248.237.122

# API Credentials (Do NOT expose these to the client side)
ERPNEXT_API_KEY=your_api_key_here
ERPNEXT_API_SECRET=your_api_secret_here
```
*(Contact the backend team if you do not have the API Key and Secret for your local environment).*

### 4. Run the Development Server

Start the local Next.js development server:

```bash
npm run dev
# or
pnpm dev
```

The application will start compiling. Once ready, open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Core Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend API**: ERPNext (REST API Integration)

## Project Structure

- `/app`: Contains all Next.js App Router pages and layouts, organized into `(auth)` and `(dashboard)` groups.
- `/components`: Reusable React components (e.g., UI elements, layouts like `Sidebar`, `Topbar`).
- `/lib`: Utility functions and the `erpnext/client.ts` integration.
- `/local-files`: Contains original reference materials and HTML prototypes.
- `/.agent`: Contains internal rules and guidelines for automated agents working on the codebase.

---

### Need Help?
If you encounter any issues during setup, ensure your Node version is updated and that the ERPNext server URL is reachable from your local network.
