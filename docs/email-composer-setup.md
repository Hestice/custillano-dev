# Email Composer Setup Guide

This guide explains how to set up the shared email composer feature that works in both web and terminal modes.

## Prerequisites

1. A Supabase project
2. A Resend account with an API key

## Setup Steps

### 1. Supabase Database Setup

Run the migration to create the `email_submissions` table:

```sql
-- This is in supabase/migrations/001_create_email_submissions.sql
-- Run this in your Supabase SQL editor or via Supabase CLI
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 2. Supabase Edge Function Setup

The Edge Function is located at `supabase/functions/send-email/index.ts`.

To deploy it:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-email
```

### 3. Configure Supabase Secrets

Set the Resend API key as a secret in your Supabase project:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

Or via the Supabase dashboard:
1. Go to your project settings
2. Navigate to Edge Functions > Secrets
3. Add `RESEND_API_KEY` with your Resend API key value

### 4. Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Alternative names (for compatibility)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 5. Update Recipient Email

The recipient email is hardcoded in the Edge Function. To change it, edit:
- `supabase/functions/send-email/index.ts` - Change the `RECIPIENT_EMAIL` constant

## Usage

### Web Mode

The email composer is integrated into the Contact section on the web page. Users can fill out the form and submit directly.

### Terminal Mode

Users can send emails via the terminal in two ways:

1. **With arguments:**
   ```bash
   email --name "John Doe" --email "john@example.com" --body "Hello, this is my message"
   ```

2. **Interactive mode:**
   ```bash
   email
   ```
   Then follow the prompts:
   - Name: (enter name)
   - Work email: (enter email)
   - Message: (enter message, press Enter twice to finish)

Press `Escape` to cancel an interactive email session.

## Testing

1. Test the web form by submitting a test email
2. Test the terminal command with arguments
3. Test the terminal interactive mode
4. Verify emails are received
5. Check the Supabase database to confirm submissions are stored

## Troubleshooting

- **"Resend API key not configured"**: Make sure you've set the `RESEND_API_KEY` secret in Supabase
- **"Supabase configuration missing"**: Check that your `.env.local` file has the correct Supabase URL and anon key
- **Function not found**: Make sure you've deployed the Edge Function using `supabase functions deploy send-email`
- **Database errors**: Ensure the migration has been run and the `email_submissions` table exists
