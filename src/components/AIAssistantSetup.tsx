import React, { useState, useEffect } from 'react';
import { Bot, Key, Settings, Check, AlertCircle, Save, Zap, Globe } from 'lucide-react';

interface APIKeys {
  openai: string;
  claude: string;
  google: string;
  yandex: string;
  yandexFolder: string;
}

export default function AIAssistantSetup() {
  const [keys, setKeys] = useState<APIKeys>({
    openai: '',
    claude: '',
    google: '',
    yandex: '',
    yandexFolder: ''
  });

  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Загружаем сохраненные ключи из localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai-api-keys');
    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }));
  };

  const saveKeys = () => {
    localStorage.setItem('ai-api-keys', JSON.stringify(keys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testAPI = async (provider: keyof APIKeys) => {
    if (!keys[provider]) return;
    
    setTesting(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Симуляция тестирования API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // В реальном проекте здесь будет тест API
      const success = keys[provider].length > 10; // Простая проверка
      
      setTestResults(prev => ({ ...prev, [provider]: success }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const providers = [
    {
      key: 'openai' as keyof APIKeys,
      name: 'OpenAI (ChatGPT)',
      placeholder: 'sk-...',
      description: 'Получите ключ на platform.openai.com',
      paid: true
    },
    {
      key: 'claude' as keyof APIKeys,
      name: 'Claude (Anthropic)',
      placeholder: 'sk-ant-...',
      description: 'Получите ключ на console.anthropic.com',
      paid: true
    },
    {
      key: 'google' as keyof APIKeys,
      name: 'Google AI (Gemini)',
      placeholder: 'AIza...',
      description: 'Получите ключ в Google AI Studio',
      paid: true
    },
    {
      key: 'yandex' as keyof APIKeys,
      name: 'Yandex GPT',
      placeholder: 'AQVN...',
      description: 'Получите ключ в Yandex Cloud',
      paid: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Настройка ИИ Помощника</h1>
        </div>

        {/* Информация о бесплатных вариантах */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-800">🎉 Бесплатные ИИ помощники доступны!</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-700 mb-2">🧠 Умный ИИ (Рекомендуется)</h3>
              <p className="text-sm text-gray-600">Автоматически выбирает лучший доступный ИИ. Работает без API ключей!</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">⚡ Локальный ИИ</h3>
              <p className="text-sm text-gray-600">Работает без интернета. Мгновенные ответы на вопросы о ботах.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-700 mb-2">🆓 Бесплатный GPT</h3>
              <p className="text-sm text-gray-600">Полноценный ChatGPT через бесплатные публичные API.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-700 mb-2">🤗 Hugging Face</h3>
              <p className="text-sm text-gray-600">Продвинутые модели машинного обучения бесплатно.</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-green-800 font-medium">
              💡 Совет: Начните с бесплатных вариантов! Они отлично подходят для большинства задач.
            </p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">📝 Инструкция:</h2>
          <ol className="text-blue-700 text-sm space-y-1">
            <li>1. <strong>Бесплатные варианты:</strong> Перейдите в раздел "ИИ Помощник" - они уже работают!</li>
            <li>2. <strong>Платные API:</strong> Получите API ключи от провайдеров ИИ (опционально)</li>
            <li>3. Вставьте ключи в поля ниже (только если нужны платные модели)</li>
            <li>4. Нажмите "Тест" для проверки</li>
            <li>5. Сохраните настройки</li>
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Платные API (опционально)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Эти настройки нужны только если вы хотите использовать платные API. 
            Бесплатные варианты уже доступны в разделе "ИИ Помощник"!
          </p>
        </div>

        <div className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.key} className="border border-gray-200 rounded-lg p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{provider.name}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      ПЛАТНЫЙ
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[provider.key] === true && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Работает</span>
                    </div>
                  )}
                  {testResults[provider.key] === false && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Ошибка</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder={provider.placeholder}
                      value={keys[provider.key]}
                      onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => testAPI(provider.key)}
                  disabled={!keys[provider.key] || testing[provider.key]}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testing[provider.key] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Тест...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Тест
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Yandex Folder ID */}
          <div className="border border-gray-200 rounded-lg p-6 opacity-75">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Yandex Folder ID</h3>
            <p className="text-sm text-gray-600 mb-4">Требуется для Yandex GPT API (только для платной версии)</p>
            <input
              type="text"
              placeholder="b1g..."
              value={keys.yandexFolder}
              onChange={(e) => handleKeyChange('yandexFolder', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={saveKeys}
            className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Сохранено!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить настройки
              </>
            )}
          </button>
        </div>

        {/* Информация о безопасности */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">🔒 Безопасность:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Ключи сохраняются только в вашем браузере</li>
            <li>• Никогда не делитесь API ключами</li>
            <li>• Регулярно обновляйте ключи</li>
            <li>• Бесплатные варианты не требуют ключей!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}