# FileBox 📦

A simple, elegant, and secure full-stack file management application built with React, Express, and SQLite.

## Features

- ✨ **Modern UI**: Clean interface with smooth animations using `motion`.
- 📁 **File Management**: Upload, download, and delete files with ease.
- 🔍 **Smart Icons**: Automatic file type detection and icon assignment.
- 🚀 **Full-Stack**: Express backend with a SQLite database for metadata persistence.
- 📱 **Responsive**: Fully optimized for mobile and desktop screens.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide Icons, Motion.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`).
- **File Handling**: Multer.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/filebox.git
   cd filebox
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`.
   - The `GEMINI_API_KEY` is optional for this specific app unless you extend it with AI features.

### Running the App

#### Development Mode
Starts both the Express server and Vite middleware:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

#### Production Mode
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   NODE_ENV=production npm start
   ```

## Project Structure

- `server.ts`: Express server entry point and API routes.
- `src/App.tsx`: Main React application.
- `src/index.css`: Global styles and Tailwind configuration.
- `uploads/`: Directory where uploaded files are stored (ignored by git).
- `files.db`: SQLite database file (ignored by git).

## License

SPDX-License-Identifier: Apache-2.0
