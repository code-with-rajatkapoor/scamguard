/*
# Create scans table (single-tenant, no auth)

1. New Tables
- `scans`
- `id` (uuid, primary key)
- `input_text` (text, the message the user scanned)
- `risk_score` (integer, 0-100 risk score)
- `risk_level` (text, "safe" | "caution" | "danger")
- `detected_indicators` (jsonb, array of detected phishing indicators with type and description)
- `summary` (text, short AI-generated summary of the analysis)
- `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on `scans`.
- Allow anon + authenticated CRUD because this is a no-auth app with intentionally shared/public scan history.
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'safe',
  detected_indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans" ON scans FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans" ON scans FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scans" ON scans;
CREATE POLICY "anon_delete_scans" ON scans FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans (created_at DESC);
