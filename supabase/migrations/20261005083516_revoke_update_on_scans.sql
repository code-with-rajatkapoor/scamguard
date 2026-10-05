/*
# Revoke unnecessary UPDATE privilege on scans table

1. Security Changes
- Revoke UPDATE privilege from both anon and authenticated roles on the `scans` table.
- The app never updates scan records (only inserts, selects, and deletes), so UPDATE access is unnecessary.
- This follows the principle of least privilege.
*/

REVOKE UPDATE ON scans FROM anon;
REVOKE UPDATE ON scans FROM authenticated;
