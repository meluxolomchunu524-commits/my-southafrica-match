
CREATE TABLE public.profile_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like','pass')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (liker_id, liked_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_likes TO authenticated;
GRANT ALL ON public.profile_likes TO service_role;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own likes" ON public.profile_likes FOR SELECT TO authenticated USING (auth.uid() = liker_id OR auth.uid() = liked_id);
CREATE POLICY "Users insert own likes" ON public.profile_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = liker_id);
CREATE POLICY "Users delete own likes" ON public.profile_likes FOR DELETE TO authenticated USING (auth.uid() = liker_id);

CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Auto-create a match when both users like each other
CREATE OR REPLACE FUNCTION public.handle_mutual_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a uuid;
  b uuid;
BEGIN
  IF NEW.action <> 'like' THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.profile_likes
    WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id AND action = 'like'
  ) THEN
    IF NEW.liker_id < NEW.liked_id THEN
      a := NEW.liker_id; b := NEW.liked_id;
    ELSE
      a := NEW.liked_id; b := NEW.liker_id;
    END IF;
    INSERT INTO public.matches (user_a, user_b) VALUES (a, b)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_like_created
AFTER INSERT ON public.profile_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_mutual_like();
