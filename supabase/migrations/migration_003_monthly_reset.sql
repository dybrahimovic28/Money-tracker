-- Create monthly_reset_logs table
CREATE TABLE IF NOT EXISTS public.monthly_reset_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Setup RLS
ALTER TABLE public.monthly_reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own monthly reset logs"
    ON public.monthly_reset_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own monthly reset logs"
    ON public.monthly_reset_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly reset logs"
    ON public.monthly_reset_logs FOR DELETE
    USING (auth.uid() = user_id);
