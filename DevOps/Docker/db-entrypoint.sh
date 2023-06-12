#!/bin/bash
set -e

# Start SQL Server
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to start
until /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "@dm1n123" -d master -Q "SELECT 1;" &> /dev/null; do
    sleep 1
done

# Execute the database initialization script
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "@dm1n123" -d master -i /docker-entrypoint-initdb.d/db-init.sql

# Keep the container running
tail -f /dev/null
