import React, { useState } from 'react';
import { 
  Bot, 
  Database, 
  Users, 
  Globe, 
  Fingerprint, 
  Cookie, 
  CreditCard, 
  MapPin, 
  Phone, 
  Key, 
  Wallet,
  MessageCircle,
  Settings as SettingsIcon
} from 'lucide-react';

// Импорт компонентов
import Dashboard from './components/Dashboard';
import ProfileManager from './components/ProfileManager';
import URLParser from './components/URLParser';
import AIChatBot from './components/AIChatBot';
import AIAssistantSetup from './components/AIAssistantSetup';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'База данных', icon: Database },
    { id: 'profiles', label: 'Профили', icon: Users },
    { id: 'urls', label: 'URL Парсер', icon: Globe },
    { id: 'fingerprints', label: 'Отпечатки', icon: Fingerprint },
    { id: 'cookies', label: 'Куки', icon: Cookie },
    { id: 'accounts', label: 'Аккаунты', icon: Users },
    { id: 'cards', label: 'Карты', icon: CreditCard },
    { id: 'addresses', label: 'Адреса', icon: MapPin },
    { id: 'phones', label: 'Телефоны', icon: Phone },
    { id: 'tokens', label: 'Токены', icon: Key },
    { id: 'wallets', label: 'Кошельки', icon: Wallet },
    { id: 'chat', label: 'ИИ Помощник', icon: MessageCircle },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profiles':
        return <ProfileManager />;
      case 'urls':
        return <URLParser />;
      case 'chat':
        return <AIChatBot />;
      case 'settings':
        return <AIAssistantSetup />;
      default:
        return (
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Раздел в разработке
              </h3>
              <p className="text-gray-500">
                Этот раздел будет доступен в следующих обновлениях
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Заголовок */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Bot Manager Pro</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                v2.0
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Полная система управления данными
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Боковая навигация */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Основной контент */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>

      {/* Подвал */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2024 Bot Manager Pro - Профессиональная система управления данными
            </div>
            <div className="flex items-center gap-4">
              <span>🔒 Данные хранятся локально</span>
              <span>⚡ Быстрый поиск</span>
              <span>📊 Аналитика</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;