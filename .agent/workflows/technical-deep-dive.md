---
description: Comprehensive technical overview of how data flows from CSV to UI
---

# Project Data Lifecycle Workflow

This workflow explains the complete journey of data within the FDE Project.

## 1. Data Ingestion (CSV to SQL)
- **Source**: User uploads a file via the Frontend `Upload.jsx` page.
- **Processing**: The backend `app.py` receives the file via `POST /upload`. 
- **Sanitization**: 
    - Spaces and dashes in column names are replaced with underscores.
    - Python's `Pandas` library is used to read the file and handle `NaN` (null) values.
- **Storage**:
    - A dynamic SQL table is created in **MySQL**.
    - Metadata is logged in the `__uploads_meta__` internal table.

## 2. Data Storage (Where it is kept)
- **Primary Data**: Stored in standard MySQL tables named after your CSV file.
- **System Metadata**:
    - `__uploads_meta__`: Tracks file names, table names, row counts, and timestamps.
    - `__query_history__`: Records every SQL query executed for performance auditing.

## 3. Data Retrieval (Accessing Data)
- **Direct Access**: The Frontend requests data via `GET /data/<table_name>`.
- **Backend Flow**: Flask connects to MySQL using `mysql-connector-python`, fetches paginated results (limit/offset), and returns them as JSON.
- **Visualization**: React renders this JSON into high-performance data tables (using CSS grid) and charts (using Recharts).

## 4. Engineering & Quality
- **Data Profiling**: When you visit `DataQuality.jsx`, the backend analyzes the MySQL table to find null percentages and unique counts for every column.
- **Audit Trails**: The history pages query the internal `__` tables to show you a timeline of your work.

## 5. CSV Reflection
- The entire project is "CSV-centric." Every feature (analytics, SQL workbench, quality checks) is built to operate on the tables created FROM your CSV files.
- **Exporting**: You can always pull data back OUT of the project into a CSV via the `ExportCenter.jsx`.
