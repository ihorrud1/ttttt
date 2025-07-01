import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Eye, EyeOff, Check, X, Globe } from 'lucide-react';

interface Proxy {
  id: string;
  name: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
  status: 'active' | 'inactive' | 'checking';
  speed?: number;
  lastChecked?: Date;
  createdAt: Date;
}

export default function ProxyManager() {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'http' as Proxy['type'],
    host: '',
    port: '',
    username: '',
    password: '',
    country: ''
  });

  useEffect(() => {
    loadProxies();
  }, []);

  const loadProxies = () => {
    const saved = localStorage.getItem('proxies');
    if (saved) {
      setProxies(JSON.parse(saved));
    }
  };

  const saveProxies = (newProxies: Proxy[]) => {
    localStorage.setItem('proxies', JSON.stringify(newProxies));
    setProxies(newProxies);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proxy: Proxy = {
      id: editingProxy?.id || `proxy_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      host: formData.host,
      port: parseInt(formData.port),
      username: formData.username || undefined,
      password: formData.password || undefined,
      country: formData.country || undefined,
      status: 'inactive',
      createdAt: editingProxy?.createdAt || new Date()
    };

    if (editingProxy) {
      const updated = proxies.map(p => p.id === editingProxy.id ? proxy : p);
      saveProxies(updated);
    } else {
      saveProxies([...proxies, proxy]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'http',
      host: '',
      port: '',
      username: '',
      password: '',
      country: ''
    });
    setShowForm(false);
    setEditingProxy(null);
  };

  const editProxy = (proxy: Proxy) => {
    setFormData({
      name: proxy.name,
      type: proxy.type,
      host: proxy.host,
      port: proxy.port.toString(),
      username: proxy.username || '',
      password: proxy.password || '',
      country: proxy.country || ''
    });
    setEditingProxy(proxy);
    setShowForm(true);
  };

  const deleteProxy = (id: string) => {
    if (confirm('Удалить прокси?')) {
      const filtered = proxies.filter(p => p.id !== id);
      saveProxies(filtered);
    }
  };

  const checkProxy = async (id: string) => {
    const updated = proxies.map(p => 
      p.id === id ? { ...p, status: 'checking' as const } : p
    );
    setProxies(updated);

    // Симуляция проверки
    setTimeout(() => {
      const finalUpdate = proxies.map(p => 
        p.id === id ? { 
          ...p, 
          status: Math.random() > 0.3 ? 'active' as const : 'inactive' as const,
          speed: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) + 100 : undefined,
          lastChecked: new Date()
        } : p
      );
      saveProxies(finalUpdate);
    }, 2000);
  };

  const importProxies = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        
        if (file.name.endsWith('.json')) {
          const imported = JSON.parse(text);
          saveProxies([...proxies, ...imported]);
        } else {
          // Формат: host:port:username:password
          const lines = text.split('\n').filter(line => line.trim());
          const newProxies: Proxy[] = lines.map((line, index) => {
            const parts = line.trim().split(':');
            return {
              id: `proxy_${Date.now()}_${index}`,
              name: `Импорт ${index + 1}`,
              type: 'http',
              host: parts[0],
              port: parseInt(parts[1]) || 8080,
              username: parts[2] || undefined,
              password: parts[3] || undefined,
              status: 'inactive',
              createdAt: new Date()
            };
          });
          saveProxies([...proxies, ...newProxies]);
        }
      } catch (error) {
        alert('Ошибка импорта файла');
      }
    };
    input.click();
  };

  const exportProxies = () => {
    const data = JSON.stringify(proxies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxies-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Менеджер прокси</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={importProxies}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Импорт
          </button>
          <button
            onClick={exportProxies}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Экспорт
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Добавить прокси
          </button>
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingProxy ? 'Редактировать прокси' : 'Добавить прокси'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as Proxy['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks4">SOCKS4</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хост</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({...formData, host: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="192.168.1.1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Порт</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="8080"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Опционально"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Опционально"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Страна</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="RU, US, DE..."
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingProxy ? 'Обновить' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список прокси */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Список прокси ({proxies.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Адрес</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Скорость</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{proxy.name}</div>
                      {proxy.country && (
                        <div className="text-sm text-gray-500">{proxy.country}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                      {proxy.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{proxy.host}:{proxy.port}</div>
                    {proxy.username && (
                      <div className="text-xs text-gray-500">Авторизация: Да</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        proxy.status === 'active' ? 'bg-green-500' :
                        proxy.status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm capitalize">{
                        proxy.status === 'active' ? 'Активен' :
                        proxy.status === 'checking' ? 'Проверка' : 'Неактивен'
                      }</span>
                    </div>
                    {proxy.lastChecked && (
                      <div className="text-xs text-gray-500">
                        {proxy.lastChecked.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {proxy.speed ? (
                      <span className="text-sm text-gray-900">{proxy.speed}ms</span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => checkProxy(proxy.id)}
                        disabled={proxy.status === 'checking'}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Проверить"
                      >
                        {proxy.status === 'checking' ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => editProxy(proxy)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProxy(proxy.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {proxies.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет прокси</h3>
              <p className="text-gray-500">Добавьте первый прокси для начала работы</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}