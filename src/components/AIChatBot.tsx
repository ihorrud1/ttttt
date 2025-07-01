import React, { useState } from 'react';
import { Bot, Send, Loader, MessageCircle, Zap, Globe, Brain, Sparkles } from 'lucide-react';
import { AIService } from '../services/aiService';

export default function AIChatBot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<'smart' | 'local' | 'huggingface' | 'freegpt' | 'openai' | 'claude' | 'google' | 'yandex'>('smart');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      let result = '';
      
      switch (selectedAI) {
        case 'smart':
          result = await AIService.callSmartAI(message);
          break;
        case 'local':
          result = await AIService.callLocalAI(message);
          break;
        case 'huggingface':
          result = await AIService.callHuggingFace(message);
          break;
        case 'freegpt':
          result = await AIService.callFreeGPT(message);
          break;
        case 'openai':
          result = await AIService.callOpenAI(message);
          break;
        case 'claude':
          result = await AIService.callClaude(message);
          break;
        case 'google':
          result = await AIService.callGoogleAI(message);
          break;
        case 'yandex':
          result = await AIService.callYandexGPT(message);
          break;
      }
      
      setResponse(result);
    } catch (error) {
      setResponse(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const aiOptions = [
    { 
      value: 'smart', 
      label: '🧠 Умный ИИ (Рекомендуется)', 
      description: 'Автоматически выбирает лучший доступный ИИ',
      free: true,
      icon: Brain
    },
    { 
      value: 'local', 
      label: '⚡ Локальный ИИ', 
      description: 'Работает без интернета, быстрые ответы',
      free: true,
      icon: Zap
    },
    { 
      value: 'freegpt', 
      label: '🆓 Бесплатный GPT', 
      description: 'GPT-3.5 через бесплатный API',
      free: true,
      icon: Globe
    },
    { 
      value: 'huggingface', 
      label: '🤗 Hugging Face', 
      description: 'Бесплатные модели от Hugging Face',
      free: true,
      icon: Sparkles
    },
    { 
      value: 'openai', 
      label: '💰 OpenAI (ChatGPT)', 
      description: 'Требует API ключ',
      free: false,
      icon: Bot
    },
    { 
      value: 'claude', 
      label: '💰 Claude (Anthropic)', 
      description: 'Требует API ключ',
      free: false,
      icon: Bot
    },
    { 
      value: 'google', 
      label: '💰 Google AI (Gemini)', 
      description: 'Требует API ключ',
      free: false,
      icon: Bot
    },
    { 
      value: 'yandex', 
      label: '💰 Yandex GPT', 
      description: 'Требует API ключ',
      free: false,
      icon: Bot
    }
  ];

  const selectedOption = aiOptions.find(option => option.value === selectedAI);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">ИИ Помощник</h1>
          <div className="ml-auto">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🆓 Бесплатные варианты доступны!
            </span>
          </div>
        </div>

        {/* Выбор ИИ */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Выберите ИИ модель:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAI === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAI(option.value as any)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{option.label}</h3>
                        {option.free && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            БЕСПЛАТНО
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    <input
                      type="radio"
                      name="ai-model"
                      checked={selectedAI === option.value}
                      onChange={() => setSelectedAI(option.value as any)}
                      className="mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Информация о выбранной модели */}
        {selectedOption && (
          <div className={`mb-6 p-4 rounded-lg ${
            selectedOption.free ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              <selectedOption.icon className="w-5 h-5" />
              <h4 className="font-semibold">{selectedOption.label}</h4>
            </div>
            <p className="text-sm mt-1">{selectedOption.description}</p>
            {selectedOption.free && (
              <p className="text-sm text-green-700 mt-2">
                ✅ Этот ИИ работает бесплатно! Никаких API ключей не требуется.
              </p>
            )}
          </div>
        )}

        {/* Форма чата */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Задайте вопрос ИИ помощнику..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Думаю...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Отправить
                </>
              )}
            </button>
          </div>
        </form>

        {/* Ответ ИИ */}
        {response && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">Ответ ИИ:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          </div>
        )}

        {/* Примеры вопросов */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">💡 Примеры вопросов:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Как настроить прокси для бота?',
              'Что такое WebRTC и зачем его отключать?',
              'Какие настройки рекламы лучше использовать?',
              'Как сделать поведение бота более человечным?',
              'Какой User Agent лучше выбрать?',
              'Как настроить DNS для безопасности?'
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="text-left p-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🎉 Преимущества бесплатных ИИ:</h4>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• <strong>Умный ИИ</strong> - автоматически выбирает лучший доступный вариант</li>
            <li>• <strong>Локальный ИИ</strong> - работает без интернета, мгновенные ответы</li>
            <li>• <strong>Бесплатный GPT</strong> - полноценный ChatGPT без оплаты</li>
            <li>• <strong>Hugging Face</strong> - продвинутые модели машинного обучения</li>
            <li>• Никаких API ключей и регистраций не требуется!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}