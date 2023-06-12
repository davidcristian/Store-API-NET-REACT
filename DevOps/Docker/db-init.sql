IF NOT EXISTS (
    SELECT name
FROM sys.databases
WHERE name = 'store'
)
CREATE DATABASE store;
GO
