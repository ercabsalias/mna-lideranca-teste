
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin_1','super_admin_2','admin');
CREATE TYPE public.record_status AS ENUM ('ativo','inativo','arquivado');
CREATE TYPE public.attendance_status AS ENUM ('presente','falta','justificada');

-- HELPER: updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  photo_url text,
  must_change_password boolean NOT NULL DEFAULT true,
  status public.record_status NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin_1','super_admin_2'));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- REGIONS / CHURCHES
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  key_prefix text NOT NULL UNIQUE,
  status public.record_status NOT NULL DEFAULT 'ativo',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.churches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name text NOT NULL,
  status public.record_status NOT NULL DEFAULT 'ativo',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (region_id, name)
);
CREATE TABLE public.admin_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, region_id)
);

CREATE OR REPLACE FUNCTION public.can_access_region(_user_id uuid, _region_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super(_user_id)
      OR EXISTS (SELECT 1 FROM public.admin_regions ar WHERE ar.user_id = _user_id AND ar.region_id = _region_id);
$$;

-- SPECIALTIES / COHORTS
CREATE TABLE public.specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  color text NOT NULL,
  description text,
  status public.record_status NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  year int NOT NULL,
  start_date date,
  end_date date,
  investiture_date date,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- TRAINERS
CREATE TABLE public.trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  photo_url text,
  phone text,
  email text,
  specialty_id uuid REFERENCES public.specialties(id) ON DELETE SET NULL,
  region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  church_id uuid REFERENCES public.churches(id) ON DELETE SET NULL,
  status public.record_status NOT NULL DEFAULT 'ativo',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- DISCIPLINES
CREATE TABLE public.disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty_id uuid REFERENCES public.specialties(id) ON DELETE SET NULL,
  trainer_id uuid REFERENCES public.trainers(id) ON DELETE SET NULL,
  weight numeric NOT NULL DEFAULT 10,
  min_grade numeric NOT NULL DEFAULT 70,
  is_required boolean NOT NULL DEFAULT true,
  description text,
  status public.record_status NOT NULL DEFAULT 'ativo',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ASSESSMENT TYPES
CREATE TABLE public.assessment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  weight numeric NOT NULL DEFAULT 25,
  status public.record_status NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PRE LEADERS
CREATE TABLE public.pre_leaders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key text NOT NULL UNIQUE,
  full_name text NOT NULL,
  photo_url text,
  birth_date date,
  gender text,
  baptism_date date,
  bi_number text NOT NULL,
  club_role text,
  club_name text,
  specialty_id uuid REFERENCES public.specialties(id) ON DELETE SET NULL,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE RESTRICT,
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE RESTRICT,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  phone text,
  email text,
  enrolled_at date NOT NULL DEFAULT current_date,
  initial_note text,
  status public.record_status NOT NULL DEFAULT 'ativo',
  is_demo boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.pre_leaders (region_id);
CREATE INDEX ON public.pre_leaders (church_id);

-- GRADES
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_leader_id uuid NOT NULL REFERENCES public.pre_leaders(id) ON DELETE CASCADE,
  discipline_id uuid REFERENCES public.disciplines(id) ON DELETE SET NULL,
  trainer_id uuid REFERENCES public.trainers(id) ON DELETE SET NULL,
  assessment_type_id uuid REFERENCES public.assessment_types(id) ON DELETE SET NULL,
  stage_label text NOT NULL DEFAULT 'Etapa',
  stage_date date NOT NULL DEFAULT current_date,
  score numeric NOT NULL,
  note text,
  is_demo boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.grades (pre_leader_id);

-- ATTENDANCE
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_leader_id uuid NOT NULL REFERENCES public.pre_leaders(id) ON DELETE CASCADE,
  discipline_id uuid REFERENCES public.disciplines(id) ON DELETE SET NULL,
  trainer_id uuid REFERENCES public.trainers(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'presente',
  note text,
  is_demo boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pre_leader_id, session_date, discipline_id)
);
CREATE INDEX ON public.attendance (pre_leader_id);

-- OBSERVATIONS
CREATE TABLE public.observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_leader_id uuid NOT NULL REFERENCES public.pre_leaders(id) ON DELETE CASCADE,
  severity int NOT NULL DEFAULT 1,
  content text NOT NULL,
  observed_at date NOT NULL DEFAULT current_date,
  is_demo boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.observations (pre_leader_id);

-- SETTINGS
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  username text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.audit_logs (created_at DESC);

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.regions, public.churches, public.admin_regions, public.specialties, public.cohorts,
  public.trainers, public.disciplines, public.assessment_types, public.pre_leaders,
  public.grades, public.attendance, public.observations, public.settings, public.audit_logs
TO authenticated;
GRANT ALL ON
  public.regions, public.churches, public.admin_regions, public.specialties, public.cohorts,
  public.trainers, public.disciplines, public.assessment_types, public.pre_leaders,
  public.grades, public.attendance, public.observations, public.settings, public.audit_logs
TO service_role;

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_super(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_super(auth.uid())) WITH CHECK (id = auth.uid() OR public.is_super(auth.uid()));
CREATE POLICY "profiles_super_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "roles_read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super(auth.uid()));

CREATE POLICY "regions_read" ON public.regions FOR SELECT TO authenticated USING (public.can_access_region(auth.uid(), id));
CREATE POLICY "regions_super_write" ON public.regions FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "churches_read" ON public.churches FOR SELECT TO authenticated USING (public.can_access_region(auth.uid(), region_id));
CREATE POLICY "churches_super_write" ON public.churches FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "admin_regions_read" ON public.admin_regions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_super(auth.uid()));
CREATE POLICY "admin_regions_super_write" ON public.admin_regions FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "specialties_read" ON public.specialties FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "specialties_super_write" ON public.specialties FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "cohorts_read" ON public.cohorts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "cohorts_super_write" ON public.cohorts FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "trainers_read" ON public.trainers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "trainers_write" ON public.trainers FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "disciplines_read" ON public.disciplines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "disciplines_super_write" ON public.disciplines FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "atypes_read" ON public.assessment_types FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "atypes_super_write" ON public.assessment_types FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "pl_read" ON public.pre_leaders FOR SELECT TO authenticated USING (public.can_access_region(auth.uid(), region_id));
CREATE POLICY "pl_insert" ON public.pre_leaders FOR INSERT TO authenticated WITH CHECK (public.can_access_region(auth.uid(), region_id));
CREATE POLICY "pl_update" ON public.pre_leaders FOR UPDATE TO authenticated USING (public.can_access_region(auth.uid(), region_id)) WITH CHECK (public.can_access_region(auth.uid(), region_id));
CREATE POLICY "pl_delete" ON public.pre_leaders FOR DELETE TO authenticated USING (public.is_super(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_access_pre_leader(_user_id uuid, _pre_leader_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pre_leaders p WHERE p.id = _pre_leader_id AND public.can_access_region(_user_id, p.region_id));
$$;

CREATE POLICY "grades_all" ON public.grades FOR ALL TO authenticated
  USING (public.can_access_pre_leader(auth.uid(), pre_leader_id))
  WITH CHECK (public.can_access_pre_leader(auth.uid(), pre_leader_id));
CREATE POLICY "attendance_all" ON public.attendance FOR ALL TO authenticated
  USING (public.can_access_pre_leader(auth.uid(), pre_leader_id))
  WITH CHECK (public.can_access_pre_leader(auth.uid(), pre_leader_id));
CREATE POLICY "observations_all" ON public.observations FOR ALL TO authenticated
  USING (public.can_access_pre_leader(auth.uid(), pre_leader_id))
  WITH CHECK (public.can_access_pre_leader(auth.uid(), pre_leader_id));

CREATE POLICY "settings_read" ON public.settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "settings_super_write" ON public.settings FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "audit_read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_super(auth.uid()));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- KEY GENERATION
CREATE OR REPLACE FUNCTION public.next_pre_leader_key(_region_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p text; n int;
BEGIN
  SELECT key_prefix INTO p FROM public.regions WHERE id = _region_id;
  IF p IS NULL THEN RAISE EXCEPTION 'Região inválida'; END IF;
  SELECT COALESCE(MAX(NULLIF(regexp_replace(access_key, '^.*_', ''), '')::int), 0) + 1
    INTO n FROM public.pre_leaders WHERE access_key LIKE 'mna_' || p || '_%';
  RETURN 'mna_' || p || '_' || lpad(n::text, 3, '0');
END; $$;

CREATE OR REPLACE FUNCTION public.pre_leaders_set_key() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.access_key IS NULL OR NEW.access_key = '' THEN
    NEW.access_key := public.next_pre_leader_key(NEW.region_id);
  END IF;
  RETURN NEW;
END; $$;
ALTER TABLE public.pre_leaders ALTER COLUMN access_key DROP NOT NULL;
CREATE TRIGGER trg_pl_key BEFORE INSERT ON public.pre_leaders FOR EACH ROW EXECUTE FUNCTION public.pre_leaders_set_key();

CREATE TRIGGER trg_pl_upd BEFORE UPDATE ON public.pre_leaders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reg_upd BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ch_upd BEFORE UPDATE ON public.churches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED
INSERT INTO public.settings (key, value) VALUES
 ('readiness_weights', '{"grades":60,"attendance":20,"completion":10,"observations":10}'::jsonb),
 ('training_config', '{"min_grade":70,"min_attendance":80,"observation_penalty":5}'::jsonb);

INSERT INTO public.specialties (slug,name,color,description) VALUES
 ('aventureiro','Aventureiro','#7B1E3A','Formação de líderes do Clube de Aventureiros'),
 ('desbravadores','Desbravadores','#1E7A45','Formação de líderes do Clube de Desbravadores'),
 ('embaixadores','Embaixadores','#5A3A22','Formação de líderes do Ministério de Embaixadores'),
 ('jovem-adulto','Jovem Adulto','#3F4650','Formação de líderes do Ministério Jovem Adulto');

INSERT INTO public.cohorts (name,year,start_date,end_date,investiture_date,is_current)
VALUES ('Formação de Líderes 2026',2026,'2026-03-01','2026-12-01','2026-12-13',true);

INSERT INTO public.assessment_types (name,weight) VALUES
 ('Prova',40),('Trabalho',20),('Prática',25),('Participação',15);

INSERT INTO public.regions (name,key_prefix,is_demo) VALUES
 ('Região Centro de Luanda','centro',true),
 ('Região de Cazenga','cazenga',true);

INSERT INTO public.churches (region_id,name,is_demo)
SELECT r.id, c.name, true FROM public.regions r
JOIN (VALUES
 ('Região Centro de Luanda','Central de Luanda'),
 ('Região Centro de Luanda','Boa Vista'),
 ('Região Centro de Luanda','Textang I'),
 ('Região Centro de Luanda','Mar da Galileia'),
 ('Região Centro de Luanda','Ilha do Cabo'),
 ('Região Centro de Luanda','Rangel'),
 ('Região Centro de Luanda','Nova Jerusalém'),
 ('Região Centro de Luanda','Maianga'),
 ('Região Centro de Luanda','Cassenda'),
 ('Região Centro de Luanda','Prenda'),
 ('Região Centro de Luanda','Jumbo'),
 ('Região Centro de Luanda','Calemba'),
 ('Região Centro de Luanda','Smirna'),
 ('Região de Cazenga','Cazenga Central'),
 ('Região de Cazenga','Cariango'),
 ('Região de Cazenga','Tunga Ngó'),
 ('Região de Cazenga','Hoji Ya Henda')
) AS c(region,name) ON c.region = r.name;

INSERT INTO public.trainers (full_name,phone,email,specialty_id,region_id,is_demo)
SELECT t.name, t.phone, t.email, s.id, r.id, true
FROM (VALUES
 ('Pr. Manuel Domingos','+244 923 000 111','manuel.d@demo.mna','desbravadores','Região Centro de Luanda'),
 ('Ana Cristina Bento','+244 923 000 222','ana.b@demo.mna','aventureiro','Região Centro de Luanda'),
 ('Josué Kiala','+244 923 000 333','josue.k@demo.mna','embaixadores','Região de Cazenga'),
 ('Esperança Lopes','+244 923 000 444','esperanca.l@demo.mna','jovem-adulto','Região de Cazenga')
) AS t(name,phone,email,slug,region)
JOIN public.specialties s ON s.slug = t.slug
JOIN public.regions r ON r.name = t.region;

INSERT INTO public.disciplines (name,specialty_id,trainer_id,weight,min_grade,is_required,is_demo)
SELECT d.name, s.id, tr.id, d.weight, 70, true, true
FROM (VALUES
 ('Liderança Cristã','desbravadores',25),
 ('Ellen G. White e o Espírito de Profecia','desbravadores',20),
 ('Administração de Clubes','desbravadores',20),
 ('Primeiros Socorros','aventureiro',20),
 ('Desenvolvimento Infantil','aventureiro',20),
 ('Discipulado e Missão','embaixadores',25),
 ('Relacionamentos e Família','jovem-adulto',20)
) AS d(name,slug,weight)
JOIN public.specialties s ON s.slug = d.slug
LEFT JOIN public.trainers tr ON tr.specialty_id = s.id;

INSERT INTO public.pre_leaders (full_name,birth_date,gender,baptism_date,bi_number,club_role,club_name,specialty_id,region_id,church_id,cohort_id,phone,enrolled_at,is_demo)
SELECT p.name, p.birth::date, p.gender, p.baptism::date, p.bi, p.role, p.club, s.id, ch.region_id, ch.id, co.id, p.phone, '2026-03-01'::date, true
FROM (VALUES
 ('João Manuel Ferreira','1999-04-12','M','2014-08-16','003948561LA041','Diretor Associado','Clube Águias Reais','desbravadores','Central de Luanda','+244 924 111 222'),
 ('Maria Luísa Cabral','2001-09-03','F','2016-05-21','004128733LA038','Secretária','Clube Estrela do Norte','aventureiro','Boa Vista','+244 924 333 444'),
 ('Pedro Neves Sousa','1997-01-25','M','2012-11-10','002884519LA027','Instrutor','Clube Vencedores','embaixadores','Cazenga Central','+244 924 555 666'),
 ('Esther Kiala Domingos','2000-06-30','F','2015-03-14','003771902LA033','Conselheira','Clube Luz do Mundo','jovem-adulto','Hoji Ya Henda','+244 924 777 888'),
 ('Alberto Cassinda','1998-12-05','M','2013-07-06','003210448LA019','Diretor','Clube Pioneiros','desbravadores','Maianga','+244 924 999 000')
) AS p(name,birth,gender,baptism,bi,role,club,slug,church,phone)
JOIN public.specialties s ON s.slug = p.slug
JOIN public.churches ch ON ch.name = p.church
JOIN public.cohorts co ON co.is_current;

INSERT INTO public.grades (pre_leader_id,discipline_id,trainer_id,assessment_type_id,stage_label,stage_date,score,is_demo)
SELECT pl.id, d.id, d.trainer_id, at.id, m.label, m.dt::date,
       round((60 + random()*38)::numeric,1), true
FROM public.pre_leaders pl
JOIN public.disciplines d ON d.specialty_id = pl.specialty_id
JOIN public.assessment_types at ON true
JOIN (VALUES ('Março','2026-03-15'),('Abril','2026-04-19'),('Maio','2026-05-17'),('Junho','2026-06-21'))
     AS m(label,dt) ON true
WHERE pl.is_demo;

INSERT INTO public.attendance (pre_leader_id,discipline_id,session_date,status,is_demo)
SELECT pl.id, NULL, d::date, CASE WHEN random() < 0.12 THEN 'falta'::public.attendance_status ELSE 'presente'::public.attendance_status END, true
FROM public.pre_leaders pl,
     generate_series('2026-03-01'::date,'2026-06-28'::date,'7 days') d
WHERE pl.is_demo;

INSERT INTO public.observations (pre_leader_id,severity,content,observed_at,is_demo)
SELECT id, 1, 'Chegou atrasado a duas sessões de formação. (dados de demonstração)', '2026-05-10', true
FROM public.pre_leaders WHERE is_demo LIMIT 2;
