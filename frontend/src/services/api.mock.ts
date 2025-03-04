import { User, PixelBoard, PixelHistory, ApiResponse } from '@/types';

// Configuration du mock API
const SIMULATE_DELAY = true; // Définir sur false pour désactiver les délais de simulation
const MIN_DELAY = 300; // Délai minimum en ms
const MAX_DELAY = 1200; // Délai maximum en ms
const ERROR_RATE = 0.1; // Probabilité d'erreur (10%)

// Fonction utilitaire pour simuler un délai réseau
const simulateNetworkDelay = async (): Promise<void> => {
  if (!SIMULATE_DELAY) return Promise.resolve();

  const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Fonction utilitaire pour simuler une erreur aléatoire
const simulateRandomError = (): boolean => {
  return Math.random() < ERROR_RATE;
};

// Simulation de réponse API générique
const simulateResponse = async <T>(data: T): Promise<ApiResponse<T>> => {
  await simulateNetworkDelay();

  if (simulateRandomError()) {
    return {
      error: 'Une erreur est survenue lors de la communication avec le serveur.',
    };
  }

  return { data };
};

// DONNÉES FICTIVES
// Utilisateurs fictifs
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-02-01T14:22:00Z',
    theme_preference: 'system',
  },
  {
    id: 'user-2',
    email: 'alice.smith@example.com',
    created_at: '2025-01-20T09:45:00Z',
    theme_preference: 'dark',
  },
  {
    id: 'user-3',
    email: 'bob.johnson@example.com',
    created_at: '2025-01-25T16:20:00Z',
    theme_preference: 'light',
  },
  // Ajoutez d'autres utilisateurs fictifs selon vos besoins
];

// PixelBoards fictifs
const mockActivePixelBoards: PixelBoard[] = [
  {
    id: 'board-1',
    title: 'Paysage de montagne',
    width: 32,
    height: 32,
    grid: generateRandomGrid(32, 32),
    cooldown: 30,
    allow_overwrite: false,
    start_time: '2025-02-15T00:00:00Z',
    end_time: '2025-03-15T00:00:00Z',
    is_active: true,
    created_at: '2025-02-14T18:30:00Z',
    admin_id: 'user-1',
  },
  {
    id: 'board-2',
    title: 'Pixel Art Rétro',
    width: 16,
    height: 16,
    grid: generateRandomGrid(16, 16),
    cooldown: 60,
    allow_overwrite: true,
    start_time: '2025-02-20T00:00:00Z',
    end_time: '2025-04-01T00:00:00Z',
    is_active: true,
    created_at: '2025-02-19T12:00:00Z',
    admin_id: 'user-2',
  },
  // Ajoutez d'autres PixelBoards actifs
];

const mockCompletedPixelBoards: PixelBoard[] = [
  {
    id: 'board-3',
    title: 'Espace Cosmique',
    width: 24,
    height: 24,
    grid: generateRandomGrid(24, 24),
    cooldown: 45,
    allow_overwrite: false,
    start_time: '2025-01-01T00:00:00Z',
    end_time: '2025-02-01T00:00:00Z',
    is_active: false,
    created_at: '2024-12-31T10:15:00Z',
    admin_id: 'user-1',
  },
  {
    id: 'board-4',
    title: 'Ville Futuriste',
    width: 48,
    height: 24,
    grid: generateRandomGrid(48, 24),
    cooldown: 30,
    allow_overwrite: true,
    start_time: '2025-01-15T00:00:00Z',
    end_time: '2025-02-10T00:00:00Z',
    is_active: false,
    created_at: '2025-01-14T09:30:00Z',
    admin_id: 'user-3',
  },
  // Ajoutez d'autres PixelBoards terminés
];

// Historique des pixels
const mockPixelHistory: Record<string, PixelHistory[]> = {
  'board-1': generateRandomPixelHistory('board-1', 50),
  'board-2': generateRandomPixelHistory('board-2', 30),
  'board-3': generateRandomPixelHistory('board-3', 100),
  'board-4': generateRandomPixelHistory('board-4', 80),
};

// Statistiques globales
const mockStats = {
  totalUsers: 156,
  totalBoards: 24,
  activeBoards: 8,
  totalPixelsPlaced: 1254789,
};

// Fonctions utilitaires pour générer des données aléatoires
function generateRandomGrid(width: number, height: number): Record<string, string> {
  const grid: Record<string, string> = {};
  const fillRate = 0.4; // 40% des pixels seront remplis

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (Math.random() < fillRate) {
        grid[`${x},${y}`] = getRandomColor();
      }
    }
  }

  return grid;
}

function generateRandomPixelHistory(boardId: string, count: number): PixelHistory[] {
  const history: PixelHistory[] = [];
  const userIds = mockUsers.map((user) => user.id);

  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 10); // Échelonner les horodatages

    history.push({
      board_id: boardId,
      x: Math.floor(Math.random() * 32),
      y: Math.floor(Math.random() * 32),
      color: getRandomColor(),
      user_id: userIds[Math.floor(Math.random() * userIds.length)],
      timestamp: timestamp.toISOString(),
    });
  }

  return history;
}

function getRandomColor(): string {
  const colors = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
    '#800080',
    '#008000',
    '#000080',
    '#800000',
    '#008080',
    '#000000',
    '#FFFFFF',
    '#808080',
    '#C0C0C0',
    '#FFC0CB',
    '#FFD700',
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

// SERVICE DE MOCK API
const MockApiService = {
  // Authentification
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    await simulateNetworkDelay();

    if (simulateRandomError()) {
      return { error: 'Échec de la connexion. Veuillez vérifier vos identifiants.' };
    }

    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return { error: 'Utilisateur non trouvé.' };
    }

    return { data: user };
  },

  register: async (email: string, password: string): Promise<ApiResponse<User>> => {
    await simulateNetworkDelay();

    if (simulateRandomError()) {
      return { error: "Échec de l'inscription. Veuillez réessayer." };
    }

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return { error: 'Cet email est déjà utilisé.' };
    }

    const newUser: User = {
      id: `user-${mockUsers.length + 1}`,
      email,
      created_at: new Date().toISOString(),
      theme_preference: 'system',
    };

    mockUsers.push(newUser);
    return { data: newUser };
  },

  // PixelBoards
  getActivePixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    return simulateResponse(mockActivePixelBoards);
  },

  getCompletedPixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    return simulateResponse(mockCompletedPixelBoards);
  },

  getAllPixelBoards: async (): Promise<ApiResponse<PixelBoard[]>> => {
    return simulateResponse([...mockActivePixelBoards, ...mockCompletedPixelBoards]);
  },

  getPixelBoardById: async (id: string): Promise<ApiResponse<PixelBoard>> => {
    await simulateNetworkDelay();

    if (simulateRandomError()) {
      return { error: 'Impossible de récupérer les détails du PixelBoard.' };
    }

    const board = [...mockActivePixelBoards, ...mockCompletedPixelBoards].find((b) => b.id === id);
    if (!board) {
      return { error: 'PixelBoard non trouvé.' };
    }

    return { data: board };
  },

  // Historique des pixels
  getPixelHistory: async (boardId: string): Promise<ApiResponse<PixelHistory[]>> => {
    await simulateNetworkDelay();

    if (simulateRandomError()) {
      return { error: "Impossible de récupérer l'historique des pixels." };
    }

    const history = mockPixelHistory[boardId] || [];
    return { data: history };
  },

  // Statistiques
  getGlobalStats: async (): Promise<ApiResponse<typeof mockStats>> => {
    return simulateResponse(mockStats);
  },

  // Contributions utilisateur
  getUserContributions: async (
    userId: string,
  ): Promise<
    ApiResponse<{
      totalPixels: number;
      boardsContributed: string[];
    }>
  > => {
    await simulateNetworkDelay();

    if (simulateRandomError()) {
      return { error: 'Impossible de récupérer les contributions.' };
    }

    // Calculer les contributions à partir de l'historique fictif
    const boardsContributed = new Set<string>();
    let totalPixels = 0;

    Object.values(mockPixelHistory).forEach((history) => {
      history.forEach((pixel) => {
        if (pixel.user_id === userId) {
          boardsContributed.add(pixel.board_id);
          totalPixels++;
        }
      });
    });

    return {
      data: {
        totalPixels,
        boardsContributed: Array.from(boardsContributed),
      },
    };
  },
};

export default MockApiService;
