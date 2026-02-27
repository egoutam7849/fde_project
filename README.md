# FDE Project - Automating CSV to SQL Datasets

The FDE Project is a complete Data Engineering utility for managing, analyzing, and querying CSV data through a professional web interface. It allows users to upload local CSV files, automatically converts them into MySQL tables, and provides tools for SQL analysis and data quality monitoring.

## Project Structure

```text
/
├── backend/            # Flask API (Python)
├── frontend/           # React Dashboard (Vite + Tailwind)
└── START.bat           # Quick-start script for Windows
```

## Quick Start (Windows)

The simplest way to run the entire project is using the provided batch file:

1. Ensure you have **Python** and **Node.js** installed.
2. Ensure you have a **MySQL** server running.
3. Configure your database credentials in `backend/app.py`.
4. Double-click `START.bat` in the root directory.

This script will:
- Install backend dependencies.
- Install frontend dependencies.
- Launch the Backend API at [http://127.0.0.1:5000](http://127.0.0.1:5000).
- Launch the Frontend Dashboard at [http://localhost:5173](http://localhost:5173).

## Individual Component Setup

For detailed instructions on running components separately, check their respective directories:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
