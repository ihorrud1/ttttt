// Реальный сервис для работы с ИИ API без симуляций
export class AIService {
  private static getKeys() {
    const saved = localStorage.getItem('ai-api-keys');
    return saved ? JSON.parse(saved) : {};
  }

  // Реальный вызов Hugging Face API
  static async callHuggingFace(message: string): Promise<string> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.generated_text || data[0]?.generated_text || 'Не удалось получить ответ от Hugging Face';
    } catch (error) {
      throw new Error(`Ошибка Hugging Face: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Локальный ИИ на основе правил (без симуляций)
  static async callLocalAI(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // База знаний для ботов
    const botKnowledge = {
      'прокси': 'Прокси-серверы скрывают ваш реальный IP адрес. Рекомендую SOCKS5 для лучшей безопасности и скорости. Настройте ротацию прокси каждые 10-15 минут.',
      'user agent': 'User Agent идентифицирует ваш браузер. Используйте актуальные UA от Chrome/Firefox. Меняйте каждые 2-3 часа для избежания детекции.',
      'webrtc': 'WebRTC может раскрыть ваш реальный IP даже через прокси. Обязательно отключите или используйте режим подделки IP.',
      'dns': 'DNS серверы переводят домены в IP. Используйте быстрые публичные DNS: 8.8.8.8, 1.1.1.1 или 208.67.222.222.',
      'отпечаток': 'Browser fingerprinting - метод идентификации по параметрам браузера. Подделывайте canvas, WebGL, аудио отпечатки.',
      'капча': 'Для обхода капчи используйте сервисы 2captcha, AntiCaptcha или RuCaptcha. Настройте автоматическое решение.',
      'реклама': 'Для монетизации настройте клики по рекламе с вероятностью 10-20%. Просматривайте видеорекламу 15-30 секунд.',
      'поведение': 'Имитируйте человеческое поведение: случайные движения мыши, скроллинг, паузы 1-5 секунд между действиями.',
      'настройка': 'Основные настройки: прокси, User Agent, отключение WebRTC, подделка отпечатков, человеческое поведение.',
      'безопасность': 'Для безопасности: используйте прокси, меняйте отпечатки, ротируйте IP, избегайте паттернов в поведении.'
    };

    // Поиск релевантного ответа
    for (const [keyword, answer] of Object.entries(botKnowledge)) {
      if (lowerMessage.includes(keyword)) {
        return answer;
      }
    }

    // Если точного совпадения нет, ищем частичные совпадения
    const partialMatches = Object.entries(botKnowledge).filter(([keyword]) => 
      lowerMessage.split(' ').some(word => keyword.includes(word) || word.includes(keyword))
    );

    if (partialMatches.length > 0) {
      return partialMatches[0][1];
    }

    // Общие ответы для неопознанных запросов
    return 'Уточните ваш вопрос. Я могу помочь с настройкой прокси, User Agent, WebRTC, отпечатков браузера, обходом капчи, монетизацией рекламы и безопасностью ботов.';
  }

  // Реальный вызов бесплатного GPT API
  static async callFreeGPT(message: string): Promise<string> {
    const endpoints = [
      'https://chatgpt-api.shn.hk/v1/',
      'https://api.chatanywhere.com.cn/v1/chat/completions',
      'https://free.netfly.top/api/openai/v1/chat/completions'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'Ты эксперт по настройке ботов и веб-автоматизации. Отвечай кратко и технически точно на русском языке.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return content.trim();
          }
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} недоступен, пробуем следующий...`);
        continue;
      }
    }

    throw new Error('Все бесплатные GPT API недоступны');
  }

  // Умный ИИ - пробует разные источники
  static async callSmartAI(message: string): Promise<string> {
    // Сначала пробуем бесплатные внешние API
    try {
      const result = await this.callFreeGPT(message);
      if (result && result.length > 20) {
        return result;
      }
    } catch (error) {
      console.log('FreeGPT недоступен:', error);
    }

    try {
      const result = await this.callHuggingFace(message);
      if (result && result.length > 20) {
        return result;
      }
    } catch (error) {
      console.log('HuggingFace недоступен:', error);
    }

    // В крайнем случае используем локальную базу знаний
    return this.callLocalAI(message);
  }

  // Реальный OpenAI API
  static async callOpenAI(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.openai) {
      throw new Error('OpenAI API ключ не найден. Добавьте ключ в настройках.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Ты эксперт по веб-автоматизации и настройке ботов. Отвечай технически точно.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Ошибка OpenAI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Реальный Claude API
  static async callClaude(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.claude) {
      throw new Error('Claude API ключ не найден. Добавьте ключ в настройках.');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': keys.claude,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      throw new Error(`Ошибка Claude: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Реальный Google AI API
  static async callGoogleAI(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.google) {
      throw new Error('Google AI API ключ не найден. Добавьте ключ в настройках.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${keys.google}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google AI API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error(`Ошибка Google AI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  // Реальный Yandex GPT API
  static async callYandexGPT(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.yandex || !keys.yandexFolder) {
      throw new Error('Yandex API ключ или Folder ID не найден. Добавьте ключи в настройках.');
    }

    try {
      const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
        method: 'POST',
        headers: {
          'Authorization': `Api-Key ${keys.yandex}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelUri: `gpt://${keys.yandexFolder}/yandexgpt-lite`,
          completionOptions: {
            stream: false,
            temperature: 0.6,
            maxTokens: 150
          },
          messages: [
            {
              role: 'user',
              text: message
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Yandex GPT API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.result.alternatives[0].message.text;
    } catch (error) {
      throw new Error(`Ошибка Yandex GPT: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}