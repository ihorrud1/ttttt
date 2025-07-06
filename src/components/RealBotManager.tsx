import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Settings, Trash2, Plus, Eye, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { RealBotService } from '../services/realBotService';

interface RealBot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'paused';
  targetSite: string;
  settings: any;
  stats: any;
  createdAt: Date;
  lastActivity: Date;
}

export default function RealBotManager() {
  const [bots, setBots] = useState<RealBot[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBot, setSelectedBot] = useState<RealBot | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetSite: '',
    proxyEnabled: false,
    proxyHost: '',
    proxyPort: '',
    proxyUsername: '',
    proxyPassword: '',
    userAgent: '',
    adInteractionEnabled: true,
    clickProbability: 15,
    humanBehaviorEnabled: true
  });

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = () => {
    const allBots = RealBotService.getAllBots();
    setBots(allBots);
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await RealBotService.createBot({
        name: formData.name,
        targetSite: formData.targetSite,
        settings: {
          proxy: {
            enabled: formData.proxyEnabled,
            host: formData.proxyHost,
            port: parseInt(formData.proxyPort) || 8080,
            username: formData.proxyUsername,
            password: formData.proxyPassword,
            type: 'http'
          },
          userAgent: formData.userAgent,
          adInteraction: {
            enabled: formData.adInteractionEnabled,
            clickProbability: formData.clickProbability / 100
          },
          humanBehavior: {
            enabled: formData.humanBehaviorEnabled,
            mouseMovements: true,
            scrolling: true,
            randomPauses: true
          }
        }
      });

      loadBots();
      setShowCreateForm(false);
      resetForm();
      
    } catch (error) {
      alert(`Ошибка создания бота: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetSite: '',
      proxyEnabled: false,
      proxyHost: '',
      proxyPort: '',
      proxyUsername: '',
      proxyPassword: '',
      userAgent: '',
      adInteractionEnabled: true,
      clickProbability: 15,
      humanBehaviorEnabled: true
    });
  };

  const startBot = async (botId: string) => {
    try {
      await RealBotService.startBot(botId);
      loadBots();
    } catch (error) {
      alert(`Ошибка запуска бота: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const stopBot = async (botId: string) => {
    try {
      await RealBotService.stopBot(botId);
      loadBots();
    } catch (error) {
      alert(`Ошибка остановки бота: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const deleteBot = async (botId: string) => {
    if (!confirm('Удалить бота? Это действие нельзя отменить.')) return;
    
    try {
      await RealBotService.deleteBot(botId);
      loadBots();
    } catch (error) {
      alert(`Ошибка удаления бота: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const getStatusIcon = (status: RealBot['status']) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'stopped': return <Pause className="w-5 h-5 text-gray-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'paused': return <Pause className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: RealBot['status']) => {
    switch (status) {
      case 'running': return 'Работает';
      case 'stopped': return 'Остановлен';
      case 'error': return 'Ошибка';
      case 'paused': return 'Пауза';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Реальные боты</h1>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Puppeteer + Реальные действия
          </span>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Создать бота
        </button>
      </div>

      {/* Форма создания бота */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Создать нового бота</h2>
          
          <form onSubmit={handleCreateBot} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название бота *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Целевой сайт *
                </label>
                <input
                  type="url"
                  value={formData.targetSite}
                  onChange={(e) => setFormData({...formData, targetSite: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            {/* Настройки прокси */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Настройки прокси</h3>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.proxyEnabled}
                  onChange={(e) => setFormData({...formData, proxyEnabled: e.target.checked})}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Использовать прокси</span>
              </label>

              {formData.proxyEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Хост прокси
                    </label>
                    <input
                      type="text"
                      value={formData.proxyHost}
                      onChange={(e) => setFormData({...formData, proxyHost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="192.168.1.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Порт
                    </label>
                    <input
                      type="number"
                      value={formData.proxyPort}
                      onChange={(e) => setFormData({...formData, proxyPort: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="8080"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Логин (опционально)
                    </label>
                    <input
                      type="text"
                      value={formData.proxyUsername}
                      onChange={(e) => setFormData({...formData, proxyUsername: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Пароль (опционально)
                    </label>
                    <input
                      type="password"
                      value={formData.proxyPassword}
                      onChange={(e) => setFormData({...formData, proxyPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Настройки поведения */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Настройки поведения</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.adInteractionEnabled}
                    onChange={(e) => setFormData({...formData, adInteractionEnabled: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Взаимодействие с рекламой</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.humanBehaviorEnabled}
                    onChange={(e) => setFormData({...formData, humanBehaviorEnabled: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Человеческое поведение</span>
                </label>
              </div>

              {formData.adInteractionEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вероятность клика по рекламе (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={formData.clickProbability}
                    onChange={(e) => setFormData({...formData, clickProbability: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Текущее значение: {formData.clickProbability}%
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Создать бота
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список ботов */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Активные боты ({bots.length})</h2>
        </div>
        
        <div className="p-6">
          {bots.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет ботов</h3>
              <p className="text-gray-500 mb-6">Создайте первого бота для начала работы</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Создать первого бота
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {bots.map((bot) => (
                <div key={bot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(bot.status)}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">{bot.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Статус: {getStatusText(bot.status)}</span>
                          <span>Сайт: {bot.targetSite}</span>
                          <span>Визитов: {bot.stats?.totalVisits || 0}</span>
                          <span>Кликов: {bot.stats?.adsClicked || 0}</span>
                        </div>
                        {bot.stats?.lastError && (
                          <div className="text-sm text-red-600 mt-1">
                            Ошибка: {bot.stats.lastError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bot.status === 'running' ? (
                        <button
                          onClick={() => stopBot(bot.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Остановить"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startBot(bot.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Запустить"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedBot(bot);
                          setShowSettings(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Настройки"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteBot(bot.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Статистика бота */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{bot.stats?.successfulVisits || 0}</div>
                        <div className="text-gray-600">Успешных</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">{bot.stats?.failedVisits || 0}</div>
                        <div className="text-gray-600">Ошибок</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{bot.stats?.adsViewed || 0}</div>
                        <div className="text-gray-600">Реклам</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          {Math.round((bot.stats?.totalRuntime || 0) / 1000 / 60)}м
                        </div>
                        <div className="text-gray-600">Время работы</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Предупреждение */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h4 className="font-semibold text-yellow-800">Важно!</h4>
        </div>
        <p className="text-yellow-700 mt-2">
          Для работы реальных ботов необходимо установить Puppeteer: <code>npm install puppeteer</code>
          <br />
          Боты будут открывать реальные браузеры и выполнять настоящие действия на сайтах.
        </p>
      </div>
    </div>
  );
}