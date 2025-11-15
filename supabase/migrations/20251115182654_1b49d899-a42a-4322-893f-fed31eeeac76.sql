-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'staff', 'superadmin');

-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  profile_pic TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
    )
  );

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  default_sla_hours INTEGER NOT NULL DEFAULT 48,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone authenticated can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only superadmin can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category UUID REFERENCES public.categories(id),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id),
  anonymous BOOLEAN NOT NULL DEFAULT false,
  sla_deadline TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaints policies
CREATE POLICY "Students can view their own complaints"
  ON public.complaints FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
    )
  );

CREATE POLICY "Students can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own complaints before review"
  ON public.complaints FOR UPDATE
  USING (
    auth.uid() = student_id AND status = 'open'
  );

CREATE POLICY "Staff can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
    )
  );

-- Create complaint attachments table
CREATE TABLE public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Attachments policies
CREATE POLICY "Users can view attachments for complaints they can see"
  ON public.complaint_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND (
        student_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Students can upload attachments to their complaints"
  ON public.complaint_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND student_id = auth.uid()
    )
  );

-- Create complaint messages table
CREATE TABLE public.complaint_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages for complaints they can see"
  ON public.complaint_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND (
        student_id = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Users can send messages to complaints they're involved in"
  ON public.complaint_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND (
        student_id = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('staff', 'superadmin')
        )
      )
    )
  );

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Only superadmin can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(complaint_id, student_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Users can view ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can rate their own resolved complaints"
  ON public.ratings FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND student_id = auth.uid() AND status IN ('resolved', 'closed')
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for complaints updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to set SLA deadline
CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category IS NOT NULL THEN
    SELECT NOW() + (default_sla_hours || ' hours')::INTERVAL
    INTO NEW.sla_deadline
    FROM public.categories
    WHERE id = NEW.category;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for SLA deadline
CREATE TRIGGER set_complaint_sla_deadline
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sla_deadline();

-- Insert default categories
INSERT INTO public.categories (name, slug, default_sla_hours) VALUES
  ('Technical Issues', 'technical', 24),
  ('Administrative', 'administrative', 48),
  ('Facilities', 'facilities', 72),
  ('Course Related', 'course', 48),
  ('Other', 'other', 48);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;