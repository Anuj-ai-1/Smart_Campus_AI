import os
import sqlite3
import csv
import io
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect

from app.core.database import get_db, engine, SessionLocal
from app.core.config import settings
from app.models.student import Student
from app.models.user import User
from seed_data import seed_database

router = APIRouter(prefix="/database", tags=["Database Management"])

@router.get("/stats")
def get_database_stats(db: Session = Depends(get_db)):
    """
    Returns database metadata: file size, tables, record counts, and engine info.
    """
    db_path = "students.db"
    file_size_bytes = os.path.getsize(db_path) if os.path.exists(db_path) else 0
    file_size_kb = round(file_size_bytes / 1024, 2)

    total_students = db.query(Student).count()
    total_users = db.query(User).count()

    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    return {
        "engine": "SQLite 3",
        "database_file": db_path,
        "file_size_kb": file_size_kb,
        "file_size_bytes": file_size_bytes,
        "tables": table_names,
        "table_counts": {
            "students": total_students,
            "users": total_users,
        },
        "total_records": total_students + total_users,
        "status": "connected"
    }

@router.get("/tables")
def list_tables(db: Session = Depends(get_db)):
    """
    Returns all tables and their schema structure.
    """
    inspector = inspect(engine)
    tables = []

    for name in inspector.get_table_names():
        columns = inspector.get_columns(name)
        pk_constraint = inspector.get_pk_constraint(name)
        pk_cols = pk_constraint.get("constrained_columns", [])

        # Get row count
        count_res = db.execute(text(f"SELECT COUNT(*) FROM {name}")).scalar()

        tables.append({
            "name": name,
            "row_count": count_res or 0,
            "columns": [
                {
                    "name": col["name"],
                    "type": str(col["type"]),
                    "nullable": col.get("nullable", True),
                    "primary_key": col["name"] in pk_cols,
                }
                for col in columns
            ],
            "primary_key": pk_cols,
        })

    return {"tables": tables}

@router.get("/tables/{table_name}/data")
def get_table_data(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    sort_by: Optional[str] = Query(None),
    order: Optional[str] = Query("asc"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetches raw rows for a specific table with pagination and search.
    """
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{table_name}' does not exist in database."
        )

    columns = [col["name"] for col in inspector.get_columns(table_name)]
    
    # Base count query
    count_query = f"SELECT COUNT(*) FROM {table_name}"
    data_query = f"SELECT * FROM {table_name}"

    where_clauses = []
    params: Dict[str, Any] = {}

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        # Search across string columns
        string_cols = [
            c["name"] for c in inspector.get_columns(table_name)
            if "VARCHAR" in str(c["type"]).upper() or "TEXT" in str(c["type"]).upper() or "CHAR" in str(c["type"]).upper()
        ]
        if string_cols:
            or_parts = [f"LOWER({c}) LIKE :search" for c in string_cols]
            where_clauses.append(f"({' OR '.join(or_parts)})")
            params["search"] = term

    if where_clauses:
        clause_str = " WHERE " + " AND ".join(where_clauses)
        count_query += clause_str
        data_query += clause_str

    total = db.execute(text(count_query), params).scalar() or 0

    # Sorting
    if sort_by and sort_by in columns:
        direction = "DESC" if order and order.lower() == "desc" else "ASC"
        data_query += f" ORDER BY {sort_by} {direction}"
    elif "student_id" in columns:
        data_query += " ORDER BY student_id ASC"
    elif "id" in columns:
        data_query += " ORDER BY id ASC"

    # Pagination
    offset = (page - 1) * page_size
    data_query += f" LIMIT {page_size} OFFSET {offset}"

    result = db.execute(text(data_query), params)
    rows = [dict(zip(columns, row)) for row in result.fetchall()]

    return {
        "table": table_name,
        "columns": columns,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 1,
        "rows": rows,
    }

@router.post("/query")
def execute_sql_query(payload: Dict[str, str], db: Session = Depends(get_db)):
    """
    Executes a custom read-only SQL query for exploration.
    Guards against destructive queries like DROP, TRUNCATE, ALTER in production.
    """
    query_str = payload.get("query", "").strip()
    if not query_str:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Guard: allow SELECT queries
    first_word = query_str.split()[0].upper()
    if first_word not in ["SELECT", "EXPLAIN", "PRAGMA"]:
        raise HTTPException(
            status_code=403,
            detail="Only read-only queries (SELECT, EXPLAIN, PRAGMA) are permitted via this console."
        )

    try:
        import time
        start_time = time.time()
        result = db.execute(text(query_str))
        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        keys = list(result.keys()) if result.returns_rows else []
        rows = [dict(zip(keys, row)) for row in result.fetchall()] if result.returns_rows else []

        return {
            "success": True,
            "query": query_str,
            "execution_time_ms": execution_time_ms,
            "columns": keys,
            "row_count": len(rows),
            "rows": rows[:200],  # cap to max 200 rows for display
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL Execution Error: {str(e)}")

@router.put("/tables/{table_name}/row")
def update_table_row(table_name: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Updates a single row in the table by its primary key.
    """
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found.")

    pk_cols = inspector.get_pk_constraint(table_name).get("constrained_columns", [])
    if not pk_cols:
        raise HTTPException(status_code=400, detail="Table does not have a primary key.")

    pk_col = pk_cols[0]
    pk_value = payload.get(pk_col)
    if pk_value is None:
        raise HTTPException(status_code=400, detail=f"Primary key '{pk_col}' must be provided.")

    columns = [col["name"] for col in inspector.get_columns(table_name)]
    update_data = {k: v for k, v in payload.items() if k in columns and k != pk_col}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid columns provided to update.")

    set_clause = ", ".join([f"{k} = :{k}" for k in update_data.keys()])
    stmt = text(f"UPDATE {table_name} SET {set_clause} WHERE {pk_col} = :pk_val")

    update_data["pk_val"] = pk_value
    try:
        db.execute(stmt, update_data)
        db.commit()

        # If updating student, recalculate their derived metrics
        if table_name == "students":
            from app.services.student_service import StudentService
            student = db.query(Student).filter(Student.student_id == pk_value).first()
            if student:
                StudentService._recalculate_student_metrics(student)
                db.commit()

        return {"success": True, "message": f"Updated row in {table_name} where {pk_col}={pk_value}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update row: {str(e)}")

@router.delete("/tables/{table_name}/row")
def delete_table_row(table_name: str, pk_value: str = Query(...), db: Session = Depends(get_db)):
    """
    Deletes a single row by primary key.
    """
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found.")

    pk_cols = inspector.get_pk_constraint(table_name).get("constrained_columns", [])
    if not pk_cols:
        raise HTTPException(status_code=400, detail="Table does not have a primary key.")

    pk_col = pk_cols[0]
    stmt = text(f"DELETE FROM {table_name} WHERE {pk_col} = :pk_val")
    try:
        res = db.execute(stmt, {"pk_val": pk_value})
        db.commit()
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Row with {pk_col}={pk_value} not found.")
        return {"success": True, "message": f"Deleted row from {table_name} where {pk_col}={pk_value}"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete row: {str(e)}")

@router.post("/reset-seed")
def reset_and_reseed_database(count: int = Query(80, ge=10, le=250), db: Session = Depends(get_db)):
    """
    Wipes the database and reseeds with realistic dummy students and demo accounts.
    """
    try:
        db.query(Student).delete()
        db.query(User).delete()
        db.commit()

        seed_database(db=db, count=count)
        return {"success": True, "message": f"Database cleared and successfully reseeded with {count} records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reseed failed: {str(e)}")

@router.get("/export/{table_name}")
def export_table_csv(table_name: str, db: Session = Depends(get_db)):
    """
    Exports the table as a downloadable CSV.
    """
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found.")

    columns = [col["name"] for col in inspector.get_columns(table_name)]
    rows = db.execute(text(f"SELECT * FROM {table_name}")).fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    for row in rows:
        writer.writerow(list(row))

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_name}_export.csv"}
    )
