-- Create savings_goals table
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0.0 NOT NULL,
  deadline timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- CRUD policies for savings_goals
CREATE POLICY "Users can CRUD own savings_goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
