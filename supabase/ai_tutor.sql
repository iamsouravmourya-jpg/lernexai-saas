-- LernexAI AI tutor history and server-side usage limits
-- Run once in the Supabase SQL Editor before using the ai-tutor function.

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 12000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_lesson_created
  ON public.ai_chat_messages(user_id, lesson_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ai_chat_daily_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0 CHECK (message_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI chat messages" ON public.ai_chat_messages;
CREATE POLICY "Users can view own AI chat messages"
  ON public.ai_chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_chat_daily_usage;
CREATE POLICY "Users can view own AI usage"
  ON public.ai_chat_daily_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Called only by the service-role Edge Function. The conditional upsert makes
-- concurrent requests unable to exceed the daily limit.
CREATE OR REPLACE FUNCTION public.consume_ai_tutor_message(
  p_user_id UUID,
  p_daily_limit INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_date DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
BEGIN
  IF p_daily_limit < 1 THEN
    RETURN -1;
  END IF;

  INSERT INTO public.ai_chat_daily_usage AS usage (
    user_id,
    usage_date,
    message_count,
    updated_at
  )
  VALUES (p_user_id, v_date, 1, NOW())
  ON CONFLICT (user_id, usage_date) DO UPDATE
    SET message_count = usage.message_count + 1,
        updated_at = NOW()
    WHERE usage.message_count < p_daily_limit
  RETURNING message_count INTO v_count;

  RETURN COALESCE(v_count, -1);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_ai_tutor_message(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
BEGIN
  UPDATE public.ai_chat_daily_usage
  SET message_count = GREATEST(message_count - 1, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND usage_date = v_date;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_tutor_message(UUID, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_ai_tutor_message(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_tutor_message(UUID, INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_ai_tutor_message(UUID)
  TO service_role;
