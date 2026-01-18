# Debugging Edge Function Errors

If you're getting "Edge Function returned a non-2xx status code", follow these steps:

## 1. Check Function Logs

```bash
supabase functions logs send-email
```

This will show you the actual error messages from the function.

## 2. Verify Secrets Are Set

Check if your Resend API key is set:

```bash
supabase secrets list
```

You should see `RESEND_API_KEY` in the list. If not, set it:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

## 3. Verify Database Table Exists

The function needs the `email_submissions` table. Run the migration:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/migrations/001_create_email_submissions.sql`:

```sql
CREATE TABLE IF NOT EXISTS email_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_submissions_created_at ON email_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_email_submissions_email ON email_submissions(email);
```

## 4. Common Error Messages

### "Resend API key not configured"
- **Fix**: Set the secret: `supabase secrets set RESEND_API_KEY=your_key`

### "Failed to store submission" / "Table 'email_submissions' may not exist"
- **Fix**: Run the database migration (step 3 above)

### "Supabase configuration missing in Edge Function"
- **Fix**: This shouldn't happen as Supabase auto-provides these. Redeploy the function.

## 5. Test the Function Directly

You can test the function using curl:

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","body":"Test message"}'
```

Replace:
- `your-project-ref` with your actual project reference
- `your-anon-key` with your Supabase anon key

## 6. Redeploy the Function

After making changes, redeploy:

```bash
supabase functions deploy send-email
```
