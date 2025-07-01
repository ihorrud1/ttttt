import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface Account {
  id: string;
  platform: string;
  email: string;
  login?: string;
  password: string;
  status: 'active' | 'banned' | 'suspended' | 'pending';
  twoFactorSecret?: string;
  recoveryEmail?: string;
  phoneNumber?: string;
  notes?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export default function AccountManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    platform: '',
    email: '',
    login: '',
    password: '',
    twoFactorSecret: '',
    recoveryEmail: '',
    phoneNumber: '',
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts');
    if (saved) {
      setAccounts(JSON.parse(saved));
    }
  };

  const saveAccounts = (newAccounts: Account[]) => {
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
    setAccounts(newAccounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const account: Account = {
      id: editingAccount?.id || `account_${Date.now()}`,
      platform: formData.platform,
      email: formData.email,
      login: formData.login || undefined,
      password: formData.password,
      status: 'active',
      twoFactorSecret: formData.twoFactorSecret || undefined,
      recoveryEmail: formData.recoveryEmail || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      notes: formData.notes || undefined,
      createdAt: editingAccount?.createdAt || new Date()
    };

    if (editingAccount) {
      const updated = accounts.map(a => a.id === editingAccount.id ? account : a);
      saveAccounts(updated);
    } else {
      saveAccounts([...accounts, account]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      email: '',
      login: '',
      password: '',
      twoFactorSecret: '',
      recoveryEmail: '',
      phoneNumber: '',
      notes: ''
    });
    setShowForm(false);
    setEditingAccount(null);
  };

  const editAccount = (account: Account) => {
    setFormData({
      platform: account.platform,
      email: account.email,
      login: account.login || '',
      password: account.password,
      twoFactorSecret: account.twoFactorSecret || '',
      recoveryEmail: account.recoveryEmail || '',
      phoneNumber: account.phoneNumber || '',
      notes: account.notes || ''
    });
    setEditingAccount(account);
    setShowForm(true);
  };

  const deleteAccount = (id: string) => {
    if (confirm('Удалить аккаунт?')) {
      const filtered = accounts.filter(a => a.id !== id);
      saveAccounts(filtered);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Account['status']) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'banned': return 'Заблокирован';
      case 'suspended': return 'Приостановлен';
      case 'pending': return 'Ожидание';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Менеджер аккаунтов</h1>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Добавить аккаунт
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingAccount ? 'Редактировать аккаунт' : 'Добавить аккаунт'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Платформа *</label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Google, Facebook, Instagram..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <input
                type="text"
                value={formData.login}
                onChange={(e) => setFormData({...formData, login: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Если отличается от email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2FA Secret</label>
              <input
                type="text"
                value={formData.twoFactorSecret}
                onChange={(e) => setFormData({...formData, twoFactorSecret: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Секретный ключ для 2FA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Резервный email</label>
              <input
                type="email"
                value={formData.recoveryEmail}
                onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Дополнительная информация..."
              />
            </div>
            
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingAccount ? 'Обновить' : 'Добавить'}
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

      {/* Список аккаунтов */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Список аккаунтов ({accounts.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Платформа</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email/Логин</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пароль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">2FA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{account.platform}</div>
                    {account.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{account.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{account.email}</div>
                    {account.login && account.login !== account.email && (
                      <div className="text-xs text-gray-500">Логин: {account.login}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {showPasswords[account.id] ? account.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(account.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(account.status)}`}>
                      {getStatusText(account.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {account.twoFactorSecret ? (
                      <span className="text-green-600 text-sm">Включен</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Отключен</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editAccount(account)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAccount(account.id)}
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
          
          {accounts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Нет аккаунтов</h3>
              <p className="text-gray-500">Добавьте первый аккаунт для начала работы</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}