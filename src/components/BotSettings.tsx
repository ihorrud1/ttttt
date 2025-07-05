import React, { useState } from 'react';
import { X, Save, Settings, Shield, Globe, Eye, Zap, Clock, Target, Database } from 'lucide-react';
import { SupabaseBotService, MonetizationBot } from '../services/supabaseService';

interface BotSettingsProps {
  bot: MonetizationBot;
  onSave: (bot: MonetizationBot) => void;
  onClose: () => void;
}

export default function BotSettings({ bot, onSave, onClose }: BotSettingsProps) {
  const [formData, setFormData] = useState({
    name: bot.name,
    targetSite: bot.target_site,
    visitIntervalMin: bot.settings?.[0]?.visit_interval_min || 30,
    visitIntervalMax: bot.settings?.[0]?.visit_interval_max || 120,
    adTypes: bot.settings?.[0]?.ad_types || ['banner', 'video'],
    humanBehavior: bot.settings?.[0]?.human_behavior || true,
    antiCaptcha: bot.settings?.[0]?.anti_captcha || true,
    userAgent: bot.settings?.[0]?.user_agent || '',
    proxyEnabled: bot.settings?.[0]?.proxy_enabled || false,
    proxyHost: bot.settings?.[0]?.proxy_host || '',
    proxyPort: bot.settings?.[0]?.proxy_port || '',
    proxyUsername: bot.settings?.[0]?.proxy_username || '',
    proxyPassword: bot.settings?.[0]?.proxy_password || '',
    dnsServers: bot.settings?.[0]?.dns_servers?.join(', ') || '8.8.8.8, 1.1.1.1',
    webrtcMode: bot.settings?.[0]?.webrtc_mode || 'disabled',
    fingerprintEnabled: bot.settings?.[0]?.fingerprint_enabled || false
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Обновляем основную информацию о боте
      await SupabaseBotService.updateBot(bot.id, {
        name: formData.name,
        target_site: formData.targetSite
      });

      // Обновляем настройки бота
      await SupabaseBotService.updateBotSettings(bot.id, {
        visit_interval_min: formData.visitIntervalMin,
        visit_interval_max: formData.visitIntervalMax,
        ad_types: formData.adTypes,
        human_behavior: formData.humanBehavior,
        anti_captcha: formData.antiCaptcha,
        user_agent: formData.userAgent,
        proxy_enabled: formData.proxyEnabled,
        proxy_host: formData.proxyEnabled ? formData.proxyHost : undefined,
        proxy_port: formData.proxyEnabled ? parseInt(formData.proxyPort.toString()) : undefined,
        proxy_username: formData.proxyEnabled ? formData.proxyUsername : undefined,
        proxy_password: formData.proxyEnabled ? formData.proxyPassword : undefined,
        dns_servers: formData.dnsServers.split(',').map(s => s.trim()).filter(s => s),
        webrtc_mode: formData.webrtcMode as any,
        fingerprint_enabled: formData.fingerprintEnabled
      });

      // Добавляем лог об обновлении настроек
      await SupabaseBotService.addBotLog({
        bot_id: bot.id,
        bot_name: formData.name,
        log_type: 'info',
        message: 'Настройки бота обновлены',
        metadata: { updated_fields: Object.keys(formData) }
      });

      onSave(bot);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка сохранения настроек в базе данных');
    } finally {
      setSaving(false);
    }
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
            <Database className="w-5 h-5 text-blue-600" />
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
                  value={formData.visitIntervalMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, visitIntervalMin: parseInt(e.target.value) }))}
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
                  value={formData.visitIntervalMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, visitIntervalMax: parseInt(e.target.value) }))}
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
                placeholder="Будет выбран автоматически из базы данных"
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
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Сохранение...' : 'Сохранить в БД'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}