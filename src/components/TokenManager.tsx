import React, { useState, useEffect } from 'react';
import { Key, Plus, Edit, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface Token {
  id: string;
  name: string;
  value: string;
  type: 'api' | 'auth' | 'session' | 'refresh' | 'access' | 'bearer' | 'jwt';
  platform: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  notes?: string;
}

export default function TokenManager() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'api' as Token['type'],
    platform: '',
    expiresAt: '',
    notes: ''
  });

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    const saved = localStorage.getItem('tokens');
    if (saved) {
      setTokens(JSON.parse(saved));
    }
  };

  const saveTokens = (newTokens: Token[]) => {
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    setTokens(newTokens);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const token: Token = {
      id: editingToken?.id || `token_${Date.now()}`,
      name: formData.name,
      value: formData.value,
      type: formData.type,
      platform: formData.platform,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      isActive: true,
      notes: formData.notes || undefined,
      createdAt: editingToken?.createdAt || new Date()
    };

    if (editingToken) {
      const updated = tokens.map(t => t.id === editingToken.id ? token : t);
      saveTokens(updated);
    } else {
      saveTokens([...tokens, token]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      type: 'api',
      platform: '',
      expiresAt: '',
      notes: ''
    });
    setShowForm(false);
    setEditingToken(null);
  };

  const editToken = (token: Token) => {
    setFormData({
      name: token.name,
      value: token.value,
      type: token.type,
      platform: token.platform,
      expiresAt: token.expiresAt ? token.expiresAt.toISOString().split('T')[0] : '',
      notes: token.notes || ''
    });
    setEditingToken(token);
    setShowForm(true);
  };

  const deleteToken = (id: string) => {
    if (confirm('Удалить токен?')) {
      const filtered = tokens.filter(t => t.id !== id);
      saveTokens(filtered);
    }
  };

  const toggleValueVisibility = (id: string) => {
    setShowValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const toggleTokenStatus = (id: string) => {
    const updated = tokens.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );
    saveTokens(updated);
  };

  const isExpired = (token: Token) => {
    return token.expiresAt && new Date() > new Date(token.expiresAt);
  };

  const getTypeColor = (type: Token['type']) => {
    switch (type) {
      case 'api': return 'bg-blue-100 text-blue-800';
      case 'auth': return 'bg-green-100 text-green-800';
      case 'session': return 'bg-yellow-100 text-yellow-800';
      case 'refresh': return 'bg-purple-100 text-purple-800';
      case 'access': return 'bg-orange-100 text-orange-800';
      case 'bearer': return 'bg-red-100 text-red-800';
      case 'jwt': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Менеджер токенов</h1>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Добавить токен
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingToken ? 'Редактировать токен' : 'Добавить токен'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="API ключ для..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as Token['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="api">API Key</option>
                <option value="auth">Auth Token</option>
                <option value="session">Session Token</option>
                <option value="refresh">Refresh Token</option>
                <option value="access">Access Token</option>
                <option value="bearer">Bearer Token</option>
                <option value="jwt">JWT Token</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Платформа *</label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="OpenAI, GitHub, Stripe..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Срок действия</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Значение токена *</label>
              <textarea
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="sk-..."
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Дополнительная информация..."
              />
            </div>
            
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingToken ? 'Обновить' : 'Добавить'}
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

      {/* Список токенов */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Список токенов ({tokens.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Платформа</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Значение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{token.name}</div>
                    {token.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{token.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getTypeColor(token.type)}`}>
                      {token.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{token.platform}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono max-w-xs truncate">
                        {showValues[token.id] ? token.value : '••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => toggleValueVisibility(token.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showValues[token.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(token.value, token.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {copiedId === token.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          !token.isActive ? 'bg-gray-400' :
                          isExpired(token) ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm">
                          {!token.isActive ? 'Отключен' :
                           isExpired(token) ? 'Истек' : 'Активен'}
                        </span>
                      </div>
                      {token.expiresAt && (
                        <div className="text-xs text-gray-500">
                          До: {new Date(token.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTokenStatus(token.id)}
                        className={`p-1 rounded ${
                          token.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={token.isActive ? 'Отключить' : 'Включить'}
                      >
                        {token.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => editToken(token)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteToken(token.id)}
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
          
          {tokens.length === 0 && (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет токенов</h3>
              <p className="text-gray-500">Добавьте первый токен для начала работы</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}