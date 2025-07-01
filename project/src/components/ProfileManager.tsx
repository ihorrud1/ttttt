import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Settings, Search } from 'lucide-react';
import { Profile } from '../types/database';
import { databaseService } from '../services/database';
import ProfileEditor from './ProfileEditor';

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await databaseService.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Ошибка загрузки профилей:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = () => {
    setSelectedProfile(null);
    setShowEditor(true);
  };

  const editProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowEditor(true);
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот профиль?')) return;
    
    try {
      await databaseService.deleteProfile(id);
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (error) {
      alert('Ошибка удаления профиля');
    }
  };

  const handleSaveProfile = async (profileData: any) => {
    try {
      if (selectedProfile) {
        // Обновление существующего профиля
        const updated = await databaseService.updateProfile(selectedProfile.id, profileData);
        if (updated) {
          setProfiles(profiles.map(p => p.id === selectedProfile.id ? updated : p));
        }
      } else {
        // Создание нового профиля
        const newProfile = await databaseService.createProfile({
          ...profileData,
          accounts: [],
          cookies: [],
          cards: [],
          addresses: [],
          phones: [],
          tokens: [],
          wallets: [],
          isActive: true,
          tags: []
        });
        setProfiles([...profiles, newProfile]);
      }
      setShowEditor(false);
      setSelectedProfile(null);
    } catch (error) {
      alert('Ошибка сохранения профиля');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Менеджер профилей</h1>
        </div>
        
        <button
          onClick={createNewProfile}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Новый профиль
        </button>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск профилей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Список профилей */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery ? 'Профили не найдены' : 'Нет профилей'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте первый профиль для начала работы'}
          </p>
          {!searchQuery && (
            <button
              onClick={createNewProfile}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Создать профиль
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                    {profile.description && (
                      <p className="text-gray-600 mt-1">{profile.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Аккаунты: {profile.accounts.length}</span>
                      <span>Куки: {profile.cookies.length}</span>
                      <span>Карты: {profile.cards.length}</span>
                      <span>Создан: {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {profile.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {profile.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${profile.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  
                  <button
                    onClick={() => editProfile(profile)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно редактора */}
      {showEditor && (
        <ProfileEditor
          profile={selectedProfile}
          onSave={handleSaveProfile}
          onClose={() => {
            setShowEditor(false);
            setSelectedProfile(null);
          }}
        />
      )}
    </div>
  );
}