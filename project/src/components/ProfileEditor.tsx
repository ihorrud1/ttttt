import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, CreditCard, MapPin, Key, Wallet } from 'lucide-react';
import { Profile } from '../types/database';

interface ProfileEditorProps {
  profile: Profile | null;
  onSave: (profileData: any) => void;
  onClose: () => void;
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    description: profile?.description || '',
    avatar: profile?.avatar || '',
    fingerprintId: profile?.fingerprintId || '',
    tags: profile?.tags?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {profile ? 'Редактировать профиль' : 'Новый профиль'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              Основная информация
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название профиля *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название профиля"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Описание профиля"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL аватара
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID отпечатка браузера
              </label>
              <input
                type="text"
                value={formData.fingerprintId}
                onChange={(e) => handleChange('fingerprintId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="fingerprint_123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги (через запятую)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="работа, личное, тест"
              />
            </div>
          </div>

          {/* Информация о связанных данных */}
          {profile && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Связанные данные</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Аккаунты</p>
                    <p className="text-lg font-bold">{profile.accounts.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Карты</p>
                    <p className="text-lg font-bold">{profile.cards.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Адреса</p>
                    <p className="text-lg font-bold">{profile.addresses.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Телефоны</p>
                    <p className="text-lg font-bold">{profile.phones.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}