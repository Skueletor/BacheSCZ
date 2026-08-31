-- =======================================================
-- SQL SCRIPT FOR SUPABASE - RELATIONAL MODEL (4 TABLES)
-- Ejecuta este script en el editor SQL de tu panel de Supabase.
-- Si ya tenías creada la tabla anterior, primero puedes borrarla
-- ejecutando: DROP TABLE IF EXISTS public.reports CASCADE;
-- =======================================================

-- Limpiar tablas previas si existen (Precaución: esto borrará datos de prueba anteriores)
DROP TABLE IF EXISTS public.report_images CASCADE;
DROP TABLE IF EXISTS public.report_history CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Coincide con id string del dominio (ej: 'vecino-scz')
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  "avatarUri" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Reportes Viales
CREATE TABLE public.reports (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  accuracy DOUBLE PRECISION,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  "suggestedRepair" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Imágenes de Reportes
CREATE TABLE public.report_images (
  id TEXT PRIMARY KEY,
  "reportId" TEXT NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Tabla de Historial de Estados de Reportes
CREATE TABLE public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reportId" TEXT NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Seguridad a Nivel de Fila (RLS) en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- Crear Políticas de acceso público (Lectura y Escritura para todas las tablas)
-- Perfiles
CREATE POLICY "Acceso público perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Inserción pública perfiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Reportes
CREATE POLICY "Lectura pública reportes" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Inserción pública reportes" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Edición pública reportes" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Borrado público reportes" ON public.reports FOR DELETE USING (true);

-- Imágenes
CREATE POLICY "Lectura pública imágenes" ON public.report_images FOR SELECT USING (true);
CREATE POLICY "Inserción pública imágenes" ON public.report_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Borrado público imágenes" ON public.report_images FOR DELETE USING (true);

-- Historial
CREATE POLICY "Lectura pública historial" ON public.report_history FOR SELECT USING (true);
CREATE POLICY "Inserción pública historial" ON public.report_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Borrado público historial" ON public.report_history FOR DELETE USING (true);
