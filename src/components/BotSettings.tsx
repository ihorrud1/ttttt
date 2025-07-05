import React, { useState } from 'react';
import { X, Save, Settings, Shield, Globe, Eye, Zap, Clock, Target } from 'lucide-react';

interface BotSettingsProps {
  bot: any;
  onSave: (bot: any) => void;
  onClose: () => void;
}

export default function BotSettings({ bot, onSave, onClose }: BotSettingsProps) {
  const [formData, setFormData] = useState({
    name: bot.name,
    targetSite: bot.targetSite,
    visitInterval: bot.settings.visitInterval,
    adTypes: bot.settings.adTypes,
    humanBehavior: bot.settings.humanBehavior,
    antiCaptcha: bot.settings.antiCaptcha,
    userAgent: bot.settings.userAgent,
    proxyEnabled: !!bot.settings.proxy,
    proxyHost: bot.settings.proxy?.host || '',
    proxyPort: bot.settings.proxy?.port || '',
    proxyUsername: bot.settings.proxy?.username || '',
    proxyPassword: bot.settings.proxy?.password || '',
    dnsServers: bot.settings.dns.join(', '),
    webrtcMode: bot.settings.webrtc.mode,
    fingerprintEnabled: !!bot.settings.fingerprint
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBot = {
      ...bot,
      name: formData.name,
      targetSite: formData.targetSite,
      settings: {
        ...bot.settings,
        visitInterval: formData.visitInterval,
        adTypes: formData.adTypes,
        humanBehavior: formData.humanBehavior,
        antiCaptcha: formData.antiCaptcha,
        userAgent: formData.userAgent,
        proxy: formData.proxyEnabled ? {
          host: formData.proxyHost,
          port: parseInt(formData.proxyPort),
          username: formData.proxyUsername || undefined,
          password: formData.proxyPassword || undefined
        } : null,
        dns: formData.dnsServers.split(',').map(s => s.trim()).filter(s => s),
        webrtc: { mode: formData.webrtcMode },
        fingerprint: formData.fingerprintEnabled ? { enabled: true } : null
      }
    };

    onSave(updatedBot);
  };

  const handleAdTypeChange = (adType: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        adTypes: [...prev.adTypes, adType]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        adTypes: prev.adTypes.filter(type => type !== adType)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Настройки бота: {bot.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Основные настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Основные настройки
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название бота *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, targetSite: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Интервалы посещений */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Интервалы посещений
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимальный интервал (секунды)
                </label>
                <input
                  type="number"
                  value={formData.visitInterval.min}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visitInterval: { ...prev.visitInterval, min: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальный интервал (секунды)
                </label>
                <input
                  type="number"
                  value={formData.visitInterval.max}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visitInterval: { ...prev.visitInterval, max: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="30"
                />
              </div>
            </div>
          </div>

          {/* Типы рекламы */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Типы рекламы для просмотра
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['banner', 'video', 'popup', 'native', 'interstitial'].map((adType) => (
                <label key={adType} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.adTypes.includes(adType)}
                    onChange={(e) => handleAdTypeChange(adType, e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm capitalize">{adType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Поведение */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Поведение и безопасность
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.humanBehavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, humanBehavior: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Имитация человеческого поведения</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.antiCaptcha}
                  onChange={(e) => setFormData(prev => ({ ...prev, antiCaptcha: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Анти-капча</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.fingerprintEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, fingerprintEnabled: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Подделка отпечатка браузера</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Agent
              </label>
              <input
                type="text"
                value={formData.userAgent}
                onChange={(e) => setFormData(prev => ({ ...prev, userAgent: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Прокси настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Прокси настройки
            </h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.proxyEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, proxyEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">Использовать прокси</span>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, proxyHost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, proxyPort: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, proxyUsername: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пароль (опционально)
                  </label>
                  <input
                    type="password"
                    value={formData.proxyPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, proxyPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Сетевые настройки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Сетевые настройки
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNS серверы (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.dnsServers}
                  onChange={(e) => setFormData(prev => ({ ...prev, dnsServers: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="8.8.8.8, 1.1.1.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WebRTC режим
                </label>
                <select
                  value={formData.webrtcMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, webrtcMode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="disabled">Отключен</option>
                  <option value="fake">Подделка IP</option>
                  <option value="real">Реальный IP</option>
                </select>
              </div>
            </div>
          </div>

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
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Save className="w-4 h-4" />
              Сохранить настройки
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}