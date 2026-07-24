-- Fix LernexAI user-owned learning tables to reference Supabase Auth users.
-- Run once in the Supabase SQL Editor.

BEGIN;

ALTER TABLE public.user_enrollments
  DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;

ALTER TABLE public.user_enrollments
  ADD CONSTRAINT user_enrollments_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.user_progress
  DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

ALTER TABLE public.user_progress
  ADD CONSTRAINT user_progress_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMIT;
