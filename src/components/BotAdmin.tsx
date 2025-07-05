import React, { useState, useEffect } from 'react';
import { Bot, Play, Pause, Settings, BarChart3, Terminal, Mic, MicOff, Users, Shield, Globe, Eye, Zap, AlertTriangle } from 'lucide-react';
import { BotService } from '../services/botService';
import { VoiceAssistant } from '../services/voiceAssistant';
import BotTerminal from './BotTerminal';
import BotStatistics from './BotStatistics';
import BotSettings from './BotSettings';

interface MonetizationBot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'paused';
  targetSite: string;
  visitCount: number;
  lastVisit: Date;
  settings: {
    visitInterval: { min: number; max: number };
    adTypes: string[];
    humanBehavior: boolean;
    antiCaptcha: boolean;
    userAgent: string;
    proxy: any;
    dns: string[];
    webrtc: any;
    fingerprint: any;
  };
  stats: {
    totalVisits: number;
    adsViewed: number;
    bannersClicked: number;
    videosWatched: number;
    earnings: number;
  };
}

export default function BotAdmin() {
  const [bots, setBots] = useState<MonetizationBot[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'statistics' | 'settings'>('dashboard');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [selectedBot, setSelectedBot] = useState<MonetizationBot | null>(null);

  useEffect(() => {
    loadBots();
    initializeVoiceAssistant();
  }, []);

  const loadBots = async () => {
    try {
      const savedBots = await BotService.getAllBots();
      setBots(savedBots);
    } catch (error) {
      console.error('Ошибка загрузки ботов:', error);
    }
  };

  const initializeVoiceAssistant = () => {
    VoiceAssistant.initialize();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      VoiceAssistant.stop();
    } else {
      VoiceAssistant.start();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const createNewBot = async () => {
    setIsCreatingBot(true);
    try {
      const newBot = await BotService.createBot({
        name: `Бот-${Date.now()}`,
        targetSite: '',
        settings: {
          visitInterval: { min: 30, max: 120 },
          adTypes: ['banner', 'video', 'popup'],
          humanBehavior: true,
          antiCaptcha: true,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          proxy: null,
          dns: ['8.8.8.8', '1.1.1.1'],
          webrtc: { mode: 'disabled' },
          fingerprint: null
        }
      });
      setBots([...bots, newBot]);
      VoiceAssistant.speak('Новый бот создан и готов к настройке');
    } catch (error) {
      console.error('Ошибка создания бота:', error);
    } finally {
      setIsCreatingBot(false);
    }
  };

  const startBot = async (botId: string) => {
    try {
      await BotService.startBot(botId);
      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: 'running' } : bot
      ));
      VoiceAssistant.speak('Бот запущен');
    } catch (error) {
      console.error('Ошибка запуска бота:', error);
    }
  };

  const stopBot = async (botId: string) => {
    try {
      await BotService.stopBot(botId);
      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: 'stopped' } : bot
      ));
      VoiceAssistant.speak('Бот остановлен');
    } catch (error) {
      console.error('Ошибка остановки бота:', error);
    }
  };

  const deleteBot = async (botId: string) => {
    if (confirm('Удалить бота?')) {
      try {
        await BotService.deleteBot(botId);
        setBots(bots.filter(bot => bot.id !== botId));
        VoiceAssistant.speak('Бот удален');
      } catch (error) {
        console.error('Ошибка удаления бота:', error);
      }
    }
  };

  const getStatusColor = (status: MonetizationBot['status']) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: MonetizationBot['status']) => {
    switch (status) {
      case 'running': return 'Работает';
      case 'stopped': return 'Остановлен';
      case 'error': return 'Ошибка';
      case 'paused': return 'Пауза';
      default: return status;
    }
  };

  const totalStats = bots.reduce((acc, bot) => ({
    totalVisits: acc.totalVisits + bot.stats.totalVisits,
    adsViewed: acc.adsViewed + bot.stats.adsViewed,
    bannersClicked: acc.bannersClicked + bot.stats.bannersClicked,
    videosWatched: acc.videosWatched + bot.stats.videosWatched,
    earnings: acc.earnings + bot.stats.earnings
  }), { totalVisits: 0, adsViewed: 0, bannersClicked: 0, videosWatched: 0, earnings: 0 });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок с голосовым помощником */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">ИИ Администратор ботов</h1>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Монетизация рекламы
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              voiceEnabled 
                ? 'bg-pink-600 text-white hover:bg-pink-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {voiceEnabled ? 'Голос ВКЛ' : 'Голос ВЫКЛ'}
          </button>
          
          <button
            onClick={createNewBot}
            disabled={isCreatingBot}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isCreatingBot ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bot className="w-4 h-4" />
            )}
            {isCreatingBot ? 'Создание...' : 'Создать бота'}
          </button>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'dashboard', label: 'Панель управления', icon: Bot },
          { id: 'terminal', label: 'Терминал', icon: Terminal },
          { id: 'statistics', label: 'Статистика', icon: BarChart3 },
          { id: 'settings', label: 'Настройки', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных ботов</p>
              <p className="text-2xl font-bold text-green-600">
                {bots.filter(bot => bot.status === 'running').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего визитов</p>
              <p className="text-2xl font-bold text-blue-600">{totalStats.totalVisits}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просмотров рекламы</p>
              <p className="text-2xl font-bold text-purple-600">{totalStats.adsViewed}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Кликов по баннерам</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.bannersClicked}</p>
            </div>
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Заработано</p>
              <p className="text-2xl font-bold text-green-600">${totalStats.earnings.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Контент в зависимости от активной вкладки */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Управление ботами ({bots.length})</h2>
          </div>
          
          <div className="p-6">
            {bots.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет ботов</h3>
                <p className="text-gray-500 mb-6">Создайте первого бота для начала монетизации</p>
                <button
                  onClick={createNewBot}
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
                          <Bot className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-800">{bot.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                              {getStatusText(bot.status)}
                            </span>
                            <span>Сайт: {bot.targetSite || 'Не настроен'}</span>
                            <span>Визитов: {bot.stats.totalVisits}</span>
                            <span>Заработано: ${bot.stats.earnings.toFixed(2)}</span>
                          </div>
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
                          onClick={() => setSelectedBot(bot)}
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
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Индикаторы безопасности */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bot.settings.proxy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-600">Прокси: {bot.settings.proxy ? 'Активен' : 'Отключен'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bot.settings.webrtc.mode !== 'real' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-gray-600">WebRTC: {bot.settings.webrtc.mode}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bot.settings.humanBehavior ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Человекоподобность: {bot.settings.humanBehavior ? 'Да' : 'Нет'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bot.settings.antiCaptcha ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-gray-600">Анти-капча: {bot.settings.antiCaptcha ? 'Вкл' : 'Выкл'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'terminal' && <BotTerminal bots={bots} />}
      {activeTab === 'statistics' && <BotStatistics bots={bots} />}
      {activeTab === 'settings' && selectedBot && (
        <BotSettings 
          bot={selectedBot} 
          onSave={(updatedBot) => {
            setBots(bots.map(b => b.id === updatedBot.id ? updatedBot : b));
            setSelectedBot(null);
          }}
          onClose={() => setSelectedBot(null)}
        />
      )}
    </div>
  );
}