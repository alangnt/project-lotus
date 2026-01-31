-- Project Lotus Database Schema
-- This file documents the current database structure

-- Users table
CREATE TABLE IF NOT EXISTS users_lotus (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users_lotus(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users_lotus(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users_lotus(created_at);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_lotus_updated_at BEFORE UPDATE ON users_lotus
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your deployment)
-- GRANT SELECT, INSERT, UPDATE ON users_lotus TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE users_lotus_id_seq TO your_app_user;
