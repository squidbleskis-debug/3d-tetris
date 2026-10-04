import React, { useState } from 'react';
import { vkPlaySDK, VKUser } from '../services/vkplay';

interface VKAuthScreenProps {
  onAuth: (user: VKUser) => void;
  onSkip: () => void;
}

export default function VKAuthScreen({ onAuth, onSkip }: VKAuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await vkPlaySDK.authenticate();
      onAuth(user);
    } catch (e) {
      setError('Ошибка авторизации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#1a0a2e] flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-2xl shadow-blue-500/30">
            <span className="text-5xl">🎮</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-2">
            3D TETRIS
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500/50"></div>
            <span className="text-blue-400/80 text-xs uppercase tracking-widest">VK Play</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500/50"></div>
          </div>
          <p className="text-gray-400 text-sm">
            Трёхмерный тетрис нового поколения
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          {/* VK Play Badge */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.258 2.182 1.814.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.972c-.045-.074-.318-.668-1.635-1.886-1.378-1.276-1.194-1.07.467-3.278.842-1.12 1.333-1.98 1.245-2.296-.075-.273-.872-.203-.872-.203l-2.45.015s-.182-.025-.317.056c-.131.079-.216.263-.216.263s-.387 1.03-.903 1.906c-1.089 1.848-1.524 1.946-1.702 1.832-.414-.265-.31-1.065-.31-1.634 0-1.776.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.865-.009-1.596.003-2.01.205-.276.135-.488.434-.36.451.16.021.522.098.714.359.248.338.24 1.097.24 1.097s.143 2.09-.333 2.349c-.327.178-.775-.185-1.737-1.846-.493-.85-.864-1.79-.864-1.79s-.072-.176-.2-.271c-.155-.115-.372-.151-.372-.151l-2.327.015s-.349.01-.477.162c-.114.135-.009.414-.009.414s1.817 4.255 3.873 6.396c1.886 1.963 4.028 1.834 4.028 1.834h.971z"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-medium">VK Play Games</div>
              <div className="text-blue-300/70 text-xs">Платформа для геймеров</div>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Подключение к VK ID...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.258 2.182 1.814.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.972c-.045-.074-.318-.668-1.635-1.886-1.378-1.276-1.194-1.07.467-3.278.842-1.12 1.333-1.98 1.245-2.296-.075-.273-.872-.203-.872-.203l-2.45.015s-.182-.025-.317.056c-.131.079-.216.263-.216.263s-.387 1.03-.903 1.906c-1.089 1.848-1.524 1.946-1.702 1.832-.414-.265-.31-1.065-.31-1.634 0-1.776.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.865-.009-1.596.003-2.01.205-.276.135-.488.434-.36.451.16.021.522.098.714.359.248.338.24 1.097.24 1.097s.143 2.09-.333 2.349c-.327.178-.775-.185-1.737-1.846-.493-.85-.864-1.79-.864-1.79s-.072-.176-.2-.271c-.155-.115-.372-.151-.372-.151l-2.327.015s-.349.01-.477.162c-.114.135-.009.414-.009.414s1.817 4.255 3.873 6.396c1.886 1.963 4.028 1.834 4.028 1.834h.971z"/>
                </svg>
                <span>Войти через VK ID</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs">или</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Play without auth */}
          <button
            onClick={onSkip}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Играть без входа</span>
            <span className="text-gray-500">→</span>
          </button>

          {/* Benefits */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-green-400">✓</span>
              <span>Сохранение прогресса в облаке</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-green-400">✓</span>
              <span>Таблица лидеров с друзьями</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-green-400">✓</span>
              <span>Достижения и награды</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs">
            Доступно на <span className="text-blue-400">VK Play</span> • v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
