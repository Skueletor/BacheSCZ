-- =====================================================================
-- SQL SCRIPTS FOR DATA MANAGEMENT - BACHESSCZ (RELATIONAL MODEL)
-- Ejecuta estos scripts en el editor SQL de tu panel de Supabase.
-- =====================================================================

-- =====================================================================
-- SCRIPT 1: LIMPIAR TODO EL CONTENIDO (CONSERVAR TABLAS)
-- Borra todos los datos de las tablas sin alterar su estructura.
-- =====================================================================

TRUNCATE TABLE 
  public.report_images, 
  public.report_history, 
  public.reports, 
  public.profiles 
RESTART IDENTITY CASCADE;



-- =====================================================================
-- SCRIPT 2: INSERTAR DATOS DE PRUEBA / EJEMPLO (SEED)
-- Población inicial para ver puntos de baches en el mapa y lista.
-- =====================================================================

-- 1. Insertar perfil de usuario de prueba
INSERT INTO public.profiles (id, name, email, neighborhood, "avatarUri")
VALUES (
  'vecino-scz',
  'Vecino Vigilante SCZ',
  'vecino@santacruz.gob.bo',
  'Casco Viejo',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insertar reportes de ejemplo
INSERT INTO public.reports (id, "userId", title, description, latitude, longitude, address, accuracy, severity, category, status, "createdAt", "updatedAt")
VALUES 
(
  'rep-scz-001',
  'vecino-scz',
  'Bache profundo en carril derecho',
  'Bache de aproximadamente 15 cm de profundidad. Se llena de agua y genera maniobras bruscas de micros y vehículos particulares.',
  -17.7712,
  -63.1958,
  'Av. Cristo Redentor (Banzer) casi 3er Anillo Externo, Zona Norte',
  8,
  'CRITICAL',
  'POTHOLE',
  'IN_PROGRESS',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 hours'
),
(
  'rep-scz-002',
  'vecino-scz',
  'Hundimiento en calzada frente a plaza',
  'Depresión notoria del pavimento junto a la acera. Podría deberse a socavación de agua subterránea.',
  -17.7818,
  -63.1814,
  'Calle 21 de Mayo y Sucre, Casco Viejo / Centro',
  12,
  'HIGH',
  'SINKING',
  'SCHEDULED',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
),
(
  'rep-scz-003',
  'vecino-scz',
  'Grietas longitudinales en asfalto',
  'Grietas que abarcan casi media cuadra. El agua de lluvia ingresa y sigue desgastando el pavimento.',
  -17.7942,
  -63.1725,
  'Av. San Aurelio y 2do Anillo, Zona Sur',
  10,
  'MEDIUM',
  'CRACK',
  'RECEIVED',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- 3. Insertar historial de estados de ejemplo
INSERT INTO public.report_history ("reportId", status, note, "createdAt")
VALUES
-- Historial del Reporte 1
('rep-scz-001', 'RECEIVED', 'Reporte registrado por vecino a través de BacheSCZ.', NOW() - INTERVAL '3 days'),
('rep-scz-001', 'UNDER_REVIEW', 'Evaluación preliminar de severidad completada.', NOW() - INTERVAL '2 days'),
('rep-scz-001', 'INSPECTION', 'Inspección técnica en terreno: se confirma riesgo vial alto.', NOW() - INTERVAL '1 day'),
('rep-scz-001', 'IN_PROGRESS', 'Cuadrilla de mantenimiento ejecutando bacheo con mezcla asfáltica en caliente.', NOW() - INTERVAL '2 hours'),

-- Historial del Reporte 2
('rep-scz-002', 'RECEIVED', 'Reporte registrado por vecino.', NOW() - INTERVAL '5 days'),
('rep-scz-002', 'UNDER_REVIEW', 'Verificación técnica aprobada.', NOW() - INTERVAL '3 days'),
('rep-scz-002', 'SCHEDULED', 'Programado para reparación por cuadrilla zona centro.', NOW() - INTERVAL '1 day'),

-- Historial del Reporte 3
('rep-scz-003', 'RECEIVED', 'Reporte de grietas recibido en el sistema.', NOW() - INTERVAL '1 day');
