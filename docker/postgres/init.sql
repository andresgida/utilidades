-- ============================================================
-- UTILIDADES — PostgreSQL Initialization
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema if needed
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO utilidades_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO utilidades_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO utilidades_user;

-- EF Core migrations will create the actual tables.
-- This file handles extensions and permissions only.
