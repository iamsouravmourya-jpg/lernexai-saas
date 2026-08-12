-- ============================================
-- CREATE TEST USER ACCOUNT
-- Run this in Supabase SQL Editor
-- ============================================

-- Test User Credentials:
-- Email: test@lernexai.com
-- Password: Test@1234
-- Name: Test User

-- Create test user in auth system
-- Note: This requires admin privileges and may need to be done through Supabase Dashboard instead

-- Alternative: Use Supabase Dashboard → Authentication → Users → Add User
-- Email: test@lernexai.com
-- Password: Test@1234
-- Auto confirm user: Yes

-- After creating user in auth, update profile data:
UPDATE users
SET
  first_name = 'Test',
  last_name = 'User',
  phone = '9876543210',
  plan_type = 'free'
WHERE email = 'test@lernexai.com';

-- Verify user creation
SELECT id, email, first_name, last_name, phone, plan_type, created_at
FROM users
WHERE email = 'test@lernexai.com';
