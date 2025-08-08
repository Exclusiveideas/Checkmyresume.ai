-- Supabase Database Setup for Resume Scanner AI
-- Run this SQL in your Supabase SQL Editor to create the emails table

CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resume_filename TEXT,
  analysis_completed BOOLEAN DEFAULT FALSE
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);

-- Create an index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Optional: Create a view to see email statistics
CREATE OR REPLACE VIEW email_stats AS
SELECT 
  COUNT(*) as total_emails,
  COUNT(CASE WHEN analysis_completed = true THEN 1 END) as completed_analyses,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as emails_today,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as emails_this_week
FROM emails;

-- Enable Row Level Security (RLS) - recommended for production
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow the service role to read/write
-- Replace 'your_service_role_key' with your actual service role
-- This policy allows full access to the service role only
CREATE POLICY "Service role can manage emails" ON emails
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');