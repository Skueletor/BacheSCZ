import { Report } from '../types/domain'

const userId = 'vecino-scz'
const now = new Date()

const getIsoDaysAgo = (days: number, hoursAgo = 0) => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)
  return d.toISOString()
}

export const seedReports: Report[] = [
  {
    id: 'rep-scz-001',
    userId,
    title: 'Bache profundo en carril derecho',
    description:
      'Bache de aproximadamente 15 cm de profundidad. Se llena de agua y genera maniobras bruscas de micros y vehículos particulares.',
    location: {
      latitude: -17.7712,
      longitude: -63.1958,
      address: 'Av. Cristo Redentor (Banzer) casi 3er Anillo Externo, Zona Norte',
      accuracy: 8,
    },
    severity: 'CRITICAL',
    category: 'POTHOLE',
    status: 'IN_PROGRESS',
    images: [],
    createdAt: getIsoDaysAgo(3, 4),
    updatedAt: getIsoDaysAgo(0, 2),
    history: [
      {
        status: 'RECEIVED',
        note: 'Reporte registrado por vecino a través de BacheSCZ.',
        createdAt: getIsoDaysAgo(3, 4),
      },
      {
        status: 'UNDER_REVIEW',
        note: 'Evaluación preliminar de severidad completada.',
        createdAt: getIsoDaysAgo(2, 6),
      },
      {
        status: 'INSPECTION',
        note: 'Inspección técnica en terreno: se confirma riesgo vial alto.',
        createdAt: getIsoDaysAgo(1, 8),
      },
      {
        status: 'IN_PROGRESS',
        note: 'Cuadrilla de mantenimiento ejecutando bacheo con mezcla asfáltica en caliente.',
        createdAt: getIsoDaysAgo(0, 2),
      },
    ],
  },
  {
    id: 'rep-scz-002',
    userId,
    title: 'Hundimiento en calzada frente a plaza',
    description:
      'Depresión notoria del pavimento junto a la acera. Podría deberse a socavación de agua subterránea.',
    location: {
      latitude: -17.7818,
      longitude: -63.1814,
      address: 'Calle 21 de Mayo y Sucre, Casco Viejo / Centro',
      accuracy: 12,
    },
    severity: 'HIGH',
    category: 'SINKING',
    status: 'SCHEDULED',
    images: [],
    createdAt: getIsoDaysAgo(5, 2),
    updatedAt: getIsoDaysAgo(1, 3),
    history: [
      {
        status: 'RECEIVED',
        note: 'Reporte registrado por vecino.',
        createdAt: getIsoDaysAgo(5, 2),
      },
      {
        status: 'UNDER_REVIEW',
        note: 'Verificación técnica aprobada.',
        createdAt: getIsoDaysAgo(3, 5),
      },
      {
        status: 'SCHEDULED',
        note: 'Programado en el plan de bacheo distrital de la semana.',
        createdAt: getIsoDaysAgo(1, 3),
      },
    ],
  },
  {
    id: 'rep-scz-003',
    userId,
    title: 'Bache en intersección concurrida',
    description:
      'Bache de tamaño medio sobre canal de giro. Los vehículos reducen la velocidad de golpe generando congestionamiento.',
    location: {
      latitude: -17.7845,
      longitude: -63.1832,
      address: 'Av. Las Palmas y Calle Los Gomeros, Barrio Equipetrol',
      accuracy: 6,
    },
    severity: 'MEDIUM',
    category: 'POTHOLE',
    status: 'INSPECTION',
    images: [],
    createdAt: getIsoDaysAgo(2, 1),
    updatedAt: getIsoDaysAgo(0, 8),
    history: [
      {
        status: 'RECEIVED',
        note: 'Reporte registrado por vecino.',
        createdAt: getIsoDaysAgo(2, 1),
      },
      {
        status: 'UNDER_REVIEW',
        note: 'Clasificado para verificación de cuadrilla de zona.',
        createdAt: getIsoDaysAgo(1, 12),
      },
      {
        status: 'INSPECTION',
        note: 'Técnico asignado para medición de dimensiones.',
        createdAt: getIsoDaysAgo(0, 8),
      },
    ],
  },
  {
    id: 'rep-scz-004',
    userId,
    title: 'Grietas longitudinales en pavimento rígido',
    description:
      'Fisuras extendidas a lo largo de 15 metros de calzada. Sellado preventivo finalizado con éxito.',
    location: {
      latitude: -17.795,
      longitude: -63.172,
      address: 'Av. Tres Pasos al Frente y 3er Anillo Interno',
      accuracy: 10,
    },
    severity: 'LOW',
    category: 'CRACK',
    status: 'RESOLVED',
    images: [],
    createdAt: getIsoDaysAgo(10, 0),
    updatedAt: getIsoDaysAgo(2, 0),
    history: [
      {
        status: 'RECEIVED',
        note: 'Reporte registrado por vecino.',
        createdAt: getIsoDaysAgo(10, 0),
      },
      {
        status: 'UNDER_REVIEW',
        note: 'Revisión técnica.',
        createdAt: getIsoDaysAgo(8, 0),
      },
      {
        status: 'SCHEDULED',
        note: 'Sellado programado.',
        createdAt: getIsoDaysAgo(5, 0),
      },
      {
        status: 'IN_PROGRESS',
        note: 'Sellado elastomérico de fisuras ejecutado.',
        createdAt: getIsoDaysAgo(3, 0),
      },
      {
        status: 'RESOLVED',
        note: 'Mantenimiento preventivo completado y verificado.',
        createdAt: getIsoDaysAgo(2, 0),
      },
    ],
  },
  {
    id: 'rep-scz-005',
    userId,
    title: 'Deterioro de carpeta asfáltica en curva',
    description:
      'Desprendimiento de árido y ondulaciones en la calzada que dificultan el frenado seguro.',
    location: {
      latitude: -17.7998,
      longitude: -63.1982,
      address: 'Av. Grigotá y 4to Anillo, Zona Sur',
      accuracy: 15,
    },
    severity: 'HIGH',
    category: 'ROAD_DAMAGE',
    status: 'UNDER_REVIEW',
    images: [],
    createdAt: getIsoDaysAgo(1, 5),
    updatedAt: getIsoDaysAgo(0, 3),
    history: [
      {
        status: 'RECEIVED',
        note: 'Reporte registrado.',
        createdAt: getIsoDaysAgo(1, 5),
      },
      {
        status: 'UNDER_REVIEW',
        note: 'En evaluación de prioridad técnica.',
        createdAt: getIsoDaysAgo(0, 3),
      },
    ],
  },
]
