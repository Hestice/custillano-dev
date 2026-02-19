-- Create email_submissions table
CREATE TABLE IF NOT EXISTS email_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_email_submissions_created_at ON email_submissions(created_at);

-- Create index on email for potential lookups
CREATE INDEX IF NOT EXISTS idx_email_submissions_email ON email_submissions(email);
