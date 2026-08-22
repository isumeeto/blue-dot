-- 1. Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  passion TEXT,
  interests TEXT,
  current_education TEXT,
  goals TEXT,
  skills TEXT,
  constraints TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create weekly_plans table
CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER,
  task_description TEXT,
  direction_chosen TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create daily_logs table
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  weekly_plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  log_date DATE,
  status TEXT CHECK (status IN ('done', 'partly', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create pulse_checks table
CREATE TABLE public.pulse_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  weekly_plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  completion_amount TEXT,
  enjoyment TEXT,
  difficulty TEXT,
  surprise_notes TEXT,
  next_step_choice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_checks ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES

-- Users can only read and update their own user record
CREATE POLICY "Users can manage their own user record" 
ON public.users FOR ALL USING (auth.uid() = id);

-- Profiles
CREATE POLICY "Users can manage their own profiles" 
ON public.profiles FOR ALL USING (auth.uid() = user_id);

-- Weekly Plans
CREATE POLICY "Users can manage their own weekly plans" 
ON public.weekly_plans FOR ALL USING (auth.uid() = user_id);

-- Daily Logs
CREATE POLICY "Users can manage their own daily logs" 
ON public.daily_logs FOR ALL USING (auth.uid() = user_id);

-- Pulse Checks
CREATE POLICY "Users can manage their own pulse checks" 
ON public.pulse_checks FOR ALL USING (auth.uid() = user_id);
