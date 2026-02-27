# Backend - FDE Project API

This is the Flask-based backend for the FDE Project, a tool for managing CSV data and performing data engineering tasks.

## Features
- **CSV Data Management**: Upload, list, and delete datasets.
- **SQL Query Support**: Execute read-only SQL queries against your datasets.
- **Data Engineering Stats**: Get trends and metadata about your data.
- **Data Quality**: Automated analysis of nulls, duplicates, and data types.

## Prerequisites
- **Python**: Version 3.10+ recommended.
- **MySQL**: The backend requires a running MySQL instance.

### Database Configuration
Update the `DB_CONFIG` dictionary in `app.py` with your MySQL credentials:
```python
DB_CONFIG = {
    'user': 'root',
    'password': 'your_password',
    'host': 'localhost',
    'database': 'csvtodataset'
}
```

## Setup and Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python app.py
   ```
   The backend will start at [http://127.0.0.1:5000](http://127.0.0.1:5000).

## API Endpoints
- `POST /upload`: Upload a CSV file to create a table.
- `GET /tables`: List all managed tables.
- `GET /stats`: Get data processing and server statistics.
- `GET /history/queries`: View recent SQL query execution history.
- `GET /quality/<table_name>`: Get data quality analysis for a specific table.
