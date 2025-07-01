import React, { useState } from 'react';
import { Bot, Plus, Settings, Play, Pause, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Bot as BotType } from '../types/bot';
import BotSettings from './BotSettings';

export default function BotManagement() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateBot, setShowCreateBot] = useState(false);

  const createNewBot = () => {
    const newBot: BotType = {
      id: `bot-${Date.now()}`,
      name: `Бот ${bots.length + 1}`,
      type: 'custom',
      status: 'offline',
      createdAt: new Date(),
      lastActivity: new Date(),
      messagesProcessed: 0,
      uptime: 0,
      version: '1.0.0',
      proxy: {
        enabled: false,
        type: 'http',
        host: '',
        port: 8080,
        rotation: false,
        rotationInterval: 30
      },
      browser: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        webrtc: {
          mode: 'fake',
          fakeIP: '192.168.1.100',
          stunServers: ['stun:stun.l.google.com:19302']
        },
        fingerprint: {
          canvas: true,
          webgl: true,
          audio: true,
          fonts: ['Arial', 'Times New Roman'],
          screen: { width: 1920, height: 1080, colorDepth: 24 },
          timezone: 'Europe/Moscow',
          language: 'ru-RU',
          platform: 'Win32'
        },
        dns: {
          servers: ['8.8.8.8', '1.1.1.1'],
          dohEnabled: true,
          dohUrl: 'https://cloudflare-dns.com/dns-query'
        },
        headers: {
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
        }
      },
      behavior: {
        clickDelay: { min: 100, max: 300 },
        scrollSpeed: 2,
        typingSpeed: { min: 50, max: 150 },
        pauseBetweenActions: { min: 1000, max: 3000 },
        humanLikeMovement: true,
        randomBreaks: true,
        breakInterval: { min: 300, max: 600 }
      },
      advertising: {
        viewAds: true,
        adTypes: [
          { type: 'banner', enabled: true, priority: 1 },
          { type: 'video', enabled: true, priority: 2 },
          { type: 'native', enabled: true, priority: 1 }
        ],
        clickRate: 15,
        viewDuration: { min: 5, max: 30 },
        skipRate: 25,
        interactionPatterns: []
      }
    };

    setBots(prev => [...prev, newBot]);
    setSelectedBot(newBot);
    setShowSettings(true);
  };

  const toggleBotStatus = (botId: string) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: bot.status === 'online' ? 'offline' : 'online' as any }
        : bot
    ));
  };

  const deleteBot = (botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId));
  };

  const updateBot = (botId: string, updates: Partial<BotType>) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, ...updates } : bot
    ));
  };

  const getStatusColor = (status: BotType['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'starting': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Управление ботами</h1>
            </div>
            <button
              onClick={createNewBot}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Создать бота
            </button>
          </div>
        </div>

        {bots.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет активных ботов</h3>
            <p className="text-gray-500 mb-6">Создайте первого бота для начала работы</p>
            <button
              onClick={createNewBot}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Создать первого бота
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {bots.map((bot) => (
                <div key={bot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">{bot.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                            {bot.status === 'online' ? 'Онлайн' : 
                             bot.status === 'offline' ? 'Офлайн' : 
                             bot.status === 'error' ? 'Ошибка' : 'Запуск'}
                          </span>
                          <span>Тип: {bot.type}</span>
                          <span>Сообщений: {bot.messagesProcessed}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBotStatus(bot.id)}
                        className={`p-2 rounded-lg ${
                          bot.status === 'online' 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={bot.status === 'online' ? 'Остановить' : 'Запустить'}
                      >
                        {bot.status === 'online' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
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

                  {/* Дополнительная информация о настройках */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bot.proxy.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-gray-600">Прокси: {bot.proxy.enabled ? 'Вкл' : 'Выкл'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bot.browser.webrtc.mode !== 'real' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-gray-600">WebRTC: {bot.browser.webrtc.mode}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bot.behavior.humanLikeMovement ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-gray-600">Человекоподобность: {bot.behavior.humanLikeMovement ? 'Да' : 'Нет'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${bot.advertising.viewAds ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span className="text-gray-600">Реклама: {bot.advertising.viewAds ? 'Просмотр' : 'Блок'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно настроек */}
      {showSettings && selectedBot && (
        <BotSettings
          bot={selectedBot}
          onSave={(updates) => {
            updateBot(selectedBot.id, updates);
            setShowSettings(false);
            setSelectedBot(null);
          }}
          onClose={() => {
            setShowSettings(false);
            setSelectedBot(null);
          }}
        />
      )}
    </div>
  );
}