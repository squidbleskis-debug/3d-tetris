import React, { useState, useEffect } from 'react';
import { vkPlaySDK, LeaderboardEntry, Achievement, VKUser } from '../services/vkplay';

interface VKPlayPanelProps {
  user: VKUser | null;
  currentScore: number;
  currentLevel: number;
  currentLines: number;
  timePlayed: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VKPlayPanel({
  user,
  currentScore,
  currentLevel,
  currentLines,
  timePlayed,
  isOpen,
  onClose,
}: VKPlayPanelProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements' | 'profile'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    const [lb, ach] = await Promise.all([
      vkPlaySDK.getLeaderboard(),
      Promise.resolve(vkPlaySDK.updateAchievements(currentScore, currentLevel, currentLines, timePlayed)),
    ]);
    setLeaderboard(lb);
    setAchievements(ach);
    setIsLoading(false);
  };

  const handleShare = async () => {
    const success = await vkPlaySDK.shareToVK(currentScore);
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/30';
      case 'rare': return 'border-blue-500/30';
      case 'epic': return 'border-purple-500/30';
      case 'legendary': return 'border-yellow-500/30';
      default: return 'border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-[#0f1629] to-[#1a0a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.258 2.182 1.814.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.972c-.045-.074-.318-.668-1.635-1.886-1.378-1.276-1.194-1.07.467-3.278.842-1.12 1.333-1.98 1.245-2.296-.075-.273-.872-.203-.872-.203l-2.45.015s-.182-.025-.317.056c-.131.079-.216.263-.216.263s-.387 1.03-.903 1.906c-1.089 1.848-1.524 1.946-1.702 1.832-.414-.265-.31-1.065-.31-1.634 0-1.776.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.865-.009-1.596.003-2.01.205-.276.135-.488.434-.36.451.16.021.522.098.714.359.248.338.24 1.097.24 1.097s.143 2.09-.333 2.349c-.327.178-.775-.185-1.737-1.846-.493-.85-.864-1.79-.864-1.79s-.072-.176-.2-.271c-.155-.115-.372-.151-.372-.151l-2.327.015s-.349.01-.477.162c-.114.135-.009.414-.009.414s1.817 4.255 3.873 6.396c1.886 1.963 4.028 1.834 4.028 1.834h.971z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">VK Play</h2>
              <p className="text-gray-400 text-xs">3D Tetris • v1.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏆 Лидерборд
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎯 Достижения
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👤 Профиль
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'leaderboard' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Друзья</h3>
                    <span className="text-gray-500 text-xs">{leaderboard.length} игроков</span>
                  </div>
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user.id + index}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        entry.user.id === 'current_user'
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      } transition-colors`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        index === 0 ? 'bg-yellow-500/20' :
                        index === 1 ? 'bg-gray-300/20' :
                        index === 2 ? 'bg-orange-500/20' : 'bg-white/5'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-xl">
                        {entry.user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {entry.user.firstName} {entry.user.lastName}
                          {entry.user.id === 'current_user' && (
                            <span className="ml-2 text-xs text-blue-400">(Вы)</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">{entry.playedAt}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">{entry.score.toLocaleString()}</div>
                        <div className="text-gray-500 text-xs">Ур. {entry.level} • {entry.lines} линий</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Достижения</h3>
                    <span className="text-gray-500 text-xs">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </span>
                  </div>
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border ${getRarityBorder(achievement.rarity)} ${
                        achievement.unlocked ? 'bg-white/5' : 'bg-white/[0.02]'
                      } transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center text-2xl ${
                          !achievement.unlocked ? 'opacity-40 grayscale' : ''
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                              achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {achievement.rarity === 'legendary' ? 'Легенда' :
                               achievement.rarity === 'epic' ? 'Эпик' :
                               achievement.rarity === 'rare' ? 'Редкое' : 'Обычное'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{achievement.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-500`}
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <div className="text-green-400 text-lg">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Profile Card */}
                  {user ? (
                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl mx-auto mb-3">
                        {user.avatar}
                      </div>
                      <h3 className="text-white text-xl font-bold">{user.firstName} {user.lastName}</h3>
                      <p className="text-gray-400 text-sm mt-1">{user.status}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-green-400 text-xs">В сети</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                      <p className="text-gray-400">Войдите через VK ID для полного доступа</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">Текущий счёт</div>
                      <div className="text-white text-xl font-bold">{currentScore.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">Уровень</div>
                      <div className="text-white text-xl font-bold">{currentLevel}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">Линии</div>
                      <div className="text-white text-xl font-bold">{currentLines}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-xs mb-1">Время игры</div>
                      <div className="text-white text-xl font-bold">{Math.floor(timePlayed / 60)}:{(timePlayed % 60).toString().padStart(2, '0')}</div>
                    </div>
                  </div>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {shareSuccess ? (
                      <>
                        <span>✓</span>
                        <span>Опубликовано!</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.258 2.182 1.814.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.972c-.045-.074-.318-.668-1.635-1.886-1.378-1.276-1.194-1.07.467-3.278.842-1.12 1.333-1.98 1.245-2.296-.075-.273-.872-.203-.872-.203l-2.45.015s-.182-.025-.317.056c-.131.079-.216.263-.216.263s-.387 1.03-.903 1.906c-1.089 1.848-1.524 1.946-1.702 1.832-.414-.265-.31-1.065-.31-1.634 0-1.776.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.865-.009-1.596.003-2.01.205-.276.135-.488.434-.36.451.16.021.522.098.714.359.248.338.24 1.097.24 1.097s.143 2.09-.333 2.349c-.327.178-.775-.185-1.737-1.846-.493-.85-.864-1.79-.864-1.79s-.072-.176-.2-.271c-.155-.115-.372-.151-.372-.151l-2.327.015s-.349.01-.477.162c-.114.135-.009.414-.009.414s1.817 4.255 3.873 6.396c1.886 1.963 4.028 1.834 4.028 1.834h.971z"/>
                        </svg>
                        <span>Поделиться в VK</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
