import React, { useState, useEffect } from 'react';
import { 
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
  Search,
  Plus,
  BarChart3,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { databaseService } from '../services/database';
import { DatabaseStats } from '../types/database';

export default function Dashboard() {
  const [stats, setStats] = useState<DatabaseStats>({
    profiles: 0,
    accounts: 0,
    webResources: 0,
    fingerprints: 0,
    cookies: 0,
    cards: 0,
    addresses: 0,
    phones: 0,
    tokens: 0,
    wallets: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const newStats = await databaseService.getStats();
    setStats(newStats);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await databaseService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await databaseService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-manager-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Ошибка экспорта данных');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = await databaseService.importData(text);
        if (success) {
          alert('Данные успешно импортированы');
          loadStats();
        } else {
          alert('Ошибка импорта данных');
        }
      } catch (error) {
        alert('Ошибка чтения файла');
      }
    };
    input.click();
  };

  const statCards = [
    { title: 'Профили', value: stats.profiles, icon: Users, color: 'bg-blue-500' },
    { title: 'Аккаунты', value: stats.accounts, icon: Users, color: 'bg-green-500' },
    { title: 'Веб-ресурсы', value: stats.webResources, icon: Globe, color: 'bg-purple-500' },
    { title: 'Отпечатки', value: stats.fingerprints, icon: Fingerprint, color: 'bg-orange-500' },
    { title: 'Куки', value: stats.cookies, icon: Cookie, color: 'bg-yellow-500' },
    { title: 'Карты', value: stats.cards, icon: CreditCard, color: 'bg-red-500' },
    { title: 'Адреса', value: stats.addresses, icon: MapPin, color: 'bg-indigo-500' },
    { title: 'Телефоны', value: stats.phones, icon: Phone, color: 'bg-pink-500' },
    { title: 'Токены', value: stats.tokens, icon: Key, color: 'bg-teal-500' },
    { title: 'Кошельки', value: stats.wallets, icon: Wallet, color: 'bg-cyan-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">База данных</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={importData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-4 h-4" />
            Импорт
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Поиск */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по базе данных..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Результаты поиска ({searchResults.length})</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-600">{result.type}</span>
                      <p className="text-gray-800">
                        {result.name || result.email || result.url || result.title || result.address}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Plus className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Новый профиль</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Globe className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Парсер URL</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Fingerprint className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Генератор отпечатков</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Аналитика</span>
          </button>
        </div>
      </div>
    </div>
  );
}