// VK Play Integration Service
// This simulates the VK Play SDK integration

export interface VKUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  status: string;
}

export interface LeaderboardEntry {
  user: VKUser;
  score: number;
  level: number;
  lines: number;
  playedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface VKPlayConfig {
  appId: string;
  appName: string;
  version: string;
}

// Mock VK Play SDK
class VKPlaySDK {
  private isAuthenticated = false;
  private currentUser: VKUser | null = null;
  private leaderboard: LeaderboardEntry[] = [];
  private achievements: Achievement[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Mock friends leaderboard
    this.leaderboard = [
      {
        user: { id: '1', firstName: 'Алексей', lastName: 'К.', avatar: '🎮', status: 'В сети' },
        score: 45200,
        level: 12,
        lines: 67,
        playedAt: '2 часа назад',
      },
      {
        user: { id: '2', firstName: 'Мария', lastName: 'С.', avatar: '👾', status: 'Играет' },
        score: 38900,
        level: 10,
        lines: 54,
        playedAt: '30 мин назад',
      },
      {
        user: { id: '3', firstName: 'Дмитрий', lastName: 'В.', avatar: '🕹️', status: 'Был(а) 1ч назад' },
        score: 32100,
        level: 9,
        lines: 48,
        playedAt: '1 час назад',
      },
      {
        user: { id: '4', firstName: 'Екатерина', lastName: 'Л.', avatar: '⭐', status: 'В сети' },
        score: 28700,
        level: 8,
        lines: 41,
        playedAt: '5 часов назад',
      },
      {
        user: { id: '5', firstName: 'Иван', lastName: 'П.', avatar: '🏆', status: 'Был(а) вчера' },
        score: 24300,
        level: 7,
        lines: 36,
        playedAt: 'Вчера',
      },
      {
        user: { id: '6', firstName: 'Ольга', lastName: 'Н.', avatar: '💎', status: 'В сети' },
        score: 19800,
        level: 6,
        lines: 29,
        playedAt: '3 часа назад',
      },
      {
        user: { id: '7', firstName: 'Сергей', lastName: 'М.', avatar: '🔥', status: 'Играет' },
        score: 15400,
        level: 5,
        lines: 22,
        playedAt: 'Сейчас',
      },
      {
        user: { id: '8', firstName: 'Анна', lastName: 'К.', avatar: '✨', status: 'Была 2ч назад' },
        score: 11200,
        level: 4,
        lines: 16,
        playedAt: '2 часа назад',
      },
    ];

    // Mock achievements
    this.achievements = [
      {
        id: 'first_drop',
        title: 'Первый блок',
        description: 'Разместите первую фигуру',
        icon: '🧱',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'common',
      },
      {
        id: 'line_clear',
        title: 'Чистильщик',
        description: 'Очистите первый слой',
        icon: '✨',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'common',
      },
      {
        id: 'ten_lines',
        title: 'Десяточка',
        description: 'Очистите 10 слоёв за игру',
        icon: '🔟',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rarity: 'rare',
      },
      {
        id: 'speed_demon',
        title: 'Скоростной демон',
        description: 'Достигните 5 уровня',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        rarity: 'rare',
      },
      {
        id: 'master_builder',
        title: 'Мастер-строитель',
        description: 'Наберите 10000 очков',
        icon: '🏗️',
        unlocked: false,
        progress: 0,
        maxProgress: 10000,
        rarity: 'epic',
      },
      {
        id: 'tetris_king',
        title: 'Король Тетриса',
        description: 'Наберите 50000 очков',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 50000,
        rarity: 'legendary',
      },
      {
        id: 'survivor',
        title: 'Выживший',
        description: 'Продержитесь 5 минут',
        icon: '💪',
        unlocked: false,
        progress: 0,
        maxProgress: 300,
        rarity: 'epic',
      },
      {
        id: 'perfect_game',
        title: 'Идеальная игра',
        description: 'Очистите 25 слоёв за одну игру',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        maxProgress: 25,
        rarity: 'legendary',
      },
    ];
  }

  async authenticate(): Promise<VKUser> {
    // Simulate VK OAuth flow
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuthenticated = true;
        this.currentUser = {
          id: 'current_user',
          firstName: 'Игрок',
          lastName: 'VK',
          avatar: '🎯',
          status: 'Играет в 3D Tetris',
        };
        resolve(this.currentUser);
      }, 1500);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuthenticated = false;
        this.currentUser = null;
        resolve();
      }, 500);
    });
  }

  getUser(): VKUser | null {
    return this.currentUser;
  }

  isAuth(): boolean {
    return this.isAuthenticated;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.leaderboard]);
      }, 800);
    });
  }

  async submitScore(score: number, level: number, lines: number): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.currentUser) {
          const entry: LeaderboardEntry = {
            user: this.currentUser,
            score,
            level,
            lines,
            playedAt: 'Только что',
          };
          this.leaderboard.push(entry);
          this.leaderboard.sort((a, b) => b.score - a.score);
          const rank = this.leaderboard.findIndex(e => e.user.id === this.currentUser?.id) + 1;
          resolve(rank);
        }
        resolve(0);
      }, 1000);
    });
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  updateAchievements(score: number, level: number, lines: number, timePlayed: number): Achievement[] {
    // Update progress
    this.achievements = this.achievements.map(a => {
      let progress = a.progress;
      switch (a.id) {
        case 'first_drop': progress = Math.min(1, lines > 0 ? 1 : 0); break;
        case 'line_clear': progress = Math.min(1, lines > 0 ? 1 : 0); break;
        case 'ten_lines': progress = Math.min(10, lines); break;
        case 'speed_demon': progress = Math.min(5, level); break;
        case 'master_builder': progress = Math.min(10000, score); break;
        case 'tetris_king': progress = Math.min(50000, score); break;
        case 'survivor': progress = Math.min(300, timePlayed); break;
        case 'perfect_game': progress = Math.min(25, lines); break;
      }
      return { ...a, progress, unlocked: progress >= a.maxProgress };
    });
    return [...this.achievements];
  }

  async shareToVK(score: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  getConfig(): VKPlayConfig {
    return {
      appId: 'vkplay_3d_tetris_2024',
      appName: '3D Tetris',
      version: '1.0.0',
    };
  }
}

export const vkPlaySDK = new VKPlaySDK();
