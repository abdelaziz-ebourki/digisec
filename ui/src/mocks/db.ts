/**
 * In-browser database backing the MSW mock API (prototype mode only).
 *
 * Persisted to localStorage so visitor-created content survives reloads;
 * sessions are persisted too so a refresh keeps the visitor logged in.
 * Passwords are plaintext here — this is a throwaway demo store, never a
 * real credential system.
 */

const DB_KEY = 'digisec-mock-db-v1'
export const DB_VERSION = 1

export interface MockUser {
  id: number
  firstName: string
  lastName: string
  email: string
  codeApoge: string
  phoneNumber: string
  /** Plaintext. Mock only. */
  password: string
  role: 'USER' | 'ADMIN'
  verified: boolean
  createdAt: string
}

export interface MockPost {
  id: number
  authorId: number
  title: string
  content: string
  createdAt: string
}

export interface MockComment {
  id: number
  postId: number
  authorId: number
  commentText: string
  createdAt: string
}

export interface MockActivity {
  id: number
  title: string
  activityDate: string
  message: string
  /** Static public path served via the /image endpoint, or null. */
  image: string | null
}

export interface MockDb {
  version: number
  users: MockUser[]
  posts: MockPost[]
  comments: MockComment[]
  activities: MockActivity[]
  /** accessToken -> userId */
  sessions: Record<string, number>
  /** verification token -> userId */
  verifyTokens: Record<string, number>
  seq: { user: number; post: number; comment: number; activity: number }
}

/** Demo admin credentials, also shown in the prototype disclosure modal. */
export const DEMO_ADMIN_EMAIL = 'admin@digisec.local'
export const DEMO_ADMIN_PASSWORD = 'DemoAdmin123!'

function seed(): MockDb {
  return {
    version: DB_VERSION,
    users: [
      {
        id: 1,
        firstName: 'Admin',
        lastName: 'DIGISEC',
        email: DEMO_ADMIN_EMAIL,
        codeApoge: 'ADMIN001',
        phoneNumber: '+212600000000',
        password: DEMO_ADMIN_PASSWORD,
        role: 'ADMIN',
        verified: true,
        createdAt: '2024-09-01T09:00:00',
      },
      {
        id: 2,
        firstName: 'Salma',
        lastName: 'Bennani',
        email: 'salma.bennani@digisec.local',
        codeApoge: '2300112',
        phoneNumber: '+212611223344',
        password: 'Demo1234!',
        role: 'USER',
        verified: true,
        createdAt: '2024-10-02T10:00:00',
      },
      {
        id: 3,
        firstName: 'Yassine',
        lastName: 'El Fassi',
        email: 'yassine.elfassi@digisec.local',
        codeApoge: '2300456',
        phoneNumber: '+212622334455',
        password: 'Demo1234!',
        role: 'USER',
        verified: true,
        createdAt: '2024-10-05T11:00:00',
      },
      {
        id: 4,
        firstName: 'Khadija',
        lastName: 'Amrani',
        email: 'khadija.amrani@digisec.local',
        codeApoge: '2300789',
        phoneNumber: '+212633445566',
        password: 'Demo1234!',
        role: 'USER',
        verified: true,
        createdAt: '2024-10-09T14:00:00',
      },
    ],
    posts: [
      {
        id: 1,
        authorId: 2,
        title: 'Bienvenue sur le forum DIGISEC',
        content:
          'Ce forum est un espace d’échange pour les membres du club : posez vos questions sur la programmation, la cybersécurité et nos ateliers.',
        createdAt: '2026-09-02T10:00:00',
      },
      {
        id: 2,
        authorId: 3,
        title: 'Quel langage pour débuter en cybersécurité ?',
        content:
          'Je recommande Python pour l’automatisation et les bases, puis du C pour comprendre la mémoire. Et vous, par quoi avez-vous commencé ?',
        createdAt: '2026-09-05T15:30:00',
      },
      {
        id: 3,
        authorId: 4,
        title: 'Retour sur l’atelier Linux',
        content:
          'Super atelier samedi dernier ! Les exercices sur les permissions et le terminal m’ont beaucoup aidée. Vivement la suite sur le réseau.',
        createdAt: '2026-09-08T18:00:00',
      },
      {
        id: 4,
        authorId: 2,
        title: 'Idées pour le prochain CTF',
        content:
          'On prépare un mini-CTF interne : web, cryptographie et OSINT. Dites-moi en commentaire les catégories que vous préférez.',
        createdAt: '2026-09-10T09:15:00',
      },
      {
        id: 5,
        authorId: 3,
        title: 'Ressources gratuites pour apprendre le réseau',
        content:
          'Voici mes favoris : la documentation Cisco NetAcad, les labs GNS3 et les vidéos sur le modèle OSI. Je peux détailler si ça intéresse.',
        createdAt: '2026-09-11T12:00:00',
      },
    ],
    comments: [
      {
        id: 1,
        postId: 2,
        authorId: 2,
        commentText: 'Python aussi pour moi, surtout pour écrire des petits scripts d’analyse.',
        createdAt: '2026-09-05T16:00:00',
      },
      {
        id: 2,
        postId: 2,
        authorId: 4,
        commentText: 'Le C m’a vraiment aidée à comprendre les failles de type buffer overflow.',
        createdAt: '2026-09-06T09:00:00',
      },
      {
        id: 3,
        postId: 4,
        authorId: 3,
        commentText: 'Je vote pour la catégorie web, avec une initiation au XSS stocké.',
        createdAt: '2026-09-10T10:00:00',
      },
    ],
    activities: [
      {
        id: 1,
        title: 'Atelier d’initiation à Linux',
        activityDate: '2026-09-06',
        message:
          'Découverte du terminal, des permissions et des commandes essentielles pour bien démarrer sous Linux.',
        image: '/images/carousel/1.jpg',
      },
      {
        id: 2,
        title: 'Conférence : les métiers de la cybersécurité',
        activityDate: '2026-09-13',
        message:
          'Pentesteurs, analystes SOC, experts forensique : panorama des parcours avec des invités du secteur.',
        image: '/images/carousel/2.jpg',
      },
      {
        id: 3,
        title: 'Formation Python pour débutants',
        activityDate: '2026-09-20',
        message:
          'Variables, boucles, fonctions et premiers scripts d’automatisation, encadrés par les membres du bureau.',
        image: '/images/carousel/4.jpg',
      },
      {
        id: 4,
        title: 'Mini-CTF interne',
        activityDate: '2026-09-27',
        message:
          'Compétition amicale par équipes : challenges web, cryptographie et OSINT, avec remise des prix.',
        image: '/images/carousel/5.jpg',
      },
      {
        id: 5,
        title: 'Atelier réseau : les fondamentaux',
        activityDate: '2026-10-04',
        message:
          'Modèle OSI, adressage IP, sous-réseaux et analyse de trafic avec Wireshark.',
        image: '/images/carousel/6.jpg',
      },
      {
        id: 6,
        title: 'Journée portes ouvertes du club',
        activityDate: '2026-10-11',
        message:
          'Venez rencontrer les membres, découvrir nos projets et vous inscrire pour la saison 2026-2027.',
        image: '/images/carousel/7.jpg',
      },
    ],
    sessions: {},
    verifyTokens: {},
    seq: { user: 5, post: 6, comment: 4, activity: 7 },
  }
}

let memory: MockDb | null = null

function storageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function loadDb(): MockDb {
  if (memory) return memory
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(DB_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as MockDb
        if (parsed.version === DB_VERSION) {
          memory = parsed
          return memory
        }
      }
    } catch {
      // Corrupt store: fall through to reseed.
    }
  }
  memory = seed()
  persist()
  return memory
}

export function persist(): void {
  if (!memory || !storageAvailable()) return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(memory))
  } catch {
    // Quota exceeded or private mode: demo keeps running in memory.
  }
}

/** Drop the persisted store and reseed. Used by tests and the demo reset. */
export function resetMockDb(): MockDb {
  memory = seed()
  persist()
  return memory
}
