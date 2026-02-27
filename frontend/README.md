# Frontend - FDE Project

This is the modern React frontend for the FDE Project, built with Vite and Tailwind CSS. It provides a professional dashboard for managing and analyzing CSV datasets.

## Key Features
- **Dynamic Dashboard**: Interactive widgets for quick statistics and table previews.
- **SQL Workbench**: Interface to run and visualize SQL queries.
- **Data Engineering Pages**:
  - **Data Quality**: Inspect tables for data integrity (missing values, types, etc.).
  - **File History**: Log of all CSV uploads with processing details.
- **Responsive Layout**: Sidebar navigation and real-time data visualization using Recharts.

## Setup and Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:5173](http://localhost:5173).

3. **Build Core Styles**:
   The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
