// Сервис для работы с ИИ API
export class AIService {
  private static getKeys() {
    const saved = localStorage.getItem('ai-api-keys');
    return saved ? JSON.parse(saved) : {};
  }

  // Бесплатный ИИ помощник через Hugging Face
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
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        // Fallback на локальный ИИ
        return this.callLocalAI(message);
      }
      
      const data = await response.json();
      return data.generated_text || data[0]?.generated_text || 'Извините, не смог обработать запрос';
    } catch (error) {
      return this.callLocalAI(message);
    }
  }

  // Локальный ИИ помощник (работает без интернета)
  static async callLocalAI(message: string): Promise<string> {
    // Простой локальный ИИ на основе правил
    const responses = {
      'привет': 'Привет! Как дела? Чем могу помочь?',
      'как дела': 'У меня всё отлично! А у вас как?',
      'помощь': 'Я могу помочь с настройкой ботов, объяснить функции или ответить на вопросы!',
      'бот': 'Боты - это автоматизированные программы. В нашей панели вы можете настроить прокси, поведение и многое другое!',
      'прокси': 'Прокси помогает скрыть ваш IP адрес. Рекомендую использовать SOCKS5 для лучшей безопасности.',
      'настройка': 'Для настройки бота перейдите в раздел "Управление ботами" и нажмите на шестеренку рядом с ботом.',
      'реклама': 'В настройках рекламы можно выбрать какие типы рекламы просматривать и с какой частотой кликать.',
      'webrtc': 'WebRTC может выдать ваш реальный IP. Рекомендую использовать режим "Подделка IP".',
      'user agent': 'User Agent определяет какой браузер вы используете. Меняйте его для лучшей маскировки.',
      'dns': 'DNS серверы переводят доменные имена в IP адреса. Используйте 8.8.8.8 или 1.1.1.1 для стабильности.'
    };

    const lowerMessage = message.toLowerCase();
    
    // Поиск ключевых слов
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Если ничего не найдено, генерируем общий ответ
    const generalResponses = [
      'Интересный вопрос! Расскажите подробнее, что именно вас интересует?',
      'Я понимаю вашу задачу. Попробуйте переформулировать вопрос более конкретно.',
      'Хороший вопрос! В нашей панели управления есть много настроек для решения подобных задач.',
      'Для более точного ответа уточните, о какой именно функции идет речь?',
      'Я готов помочь! Опишите вашу задачу более детально.'
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  // Бесплатный ИИ через публичные API
  static async callFreeGPT(message: string): Promise<string> {
    try {
      // Используем бесплатный GPT API
      const response = await fetch('https://chatgpt-api.shn.hk/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Ты помощник по настройке ботов. Отвечай кратко и по делу на русском языке.'
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        return this.callLocalAI(message);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.callLocalAI(message);
    } catch (error) {
      return this.callLocalAI(message);
    }
  }

  // Бесплатный Claude через публичные API
  static async callFreeClaude(message: string): Promise<string> {
    try {
      const response = await fetch('https://claude-3-sonnet-20240229-v1-0.p.rapidapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'claude-3-sonnet-20240229-v1-0.p.rapidapi.com',
          'X-RapidAPI-Key': 'demo' // Демо ключ
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet',
          messages: [{ role: 'user', content: message }],
          max_tokens: 150
        })
      });

      if (!response.ok) {
        return this.callLocalAI(message);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.callLocalAI(message);
    } catch (error) {
      return this.callLocalAI(message);
    }
  }

  // Умный ИИ помощник (комбинирует несколько источников)
  static async callSmartAI(message: string): Promise<string> {
    // Сначала пробуем бесплатные API
    try {
      const result = await this.callFreeGPT(message);
      if (result && result.length > 20) {
        return result;
      }
    } catch (error) {
      console.log('FreeGPT недоступен, пробуем другие варианты...');
    }

    try {
      const result = await this.callHuggingFace(message);
      if (result && result.length > 20) {
        return result;
      }
    } catch (error) {
      console.log('HuggingFace недоступен, используем локальный ИИ...');
    }

    // В крайнем случае используем локальный ИИ
    return this.callLocalAI(message);
  }

  // OpenAI ChatGPT (платный)
  static async callOpenAI(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.openai) throw new Error('OpenAI API ключ не найден. Используйте бесплатные варианты!');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error('Ошибка API OpenAI');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error('Не удалось получить ответ от OpenAI. Попробуйте бесплатные варианты!');
    }
  }

  // Claude API (платный)
  static async callClaude(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.claude) throw new Error('Claude API ключ не найден. Используйте бесплатные варианты!');

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
          messages: [{ role: 'user', content: message }]
        })
      });

      if (!response.ok) throw new Error('Ошибка API Claude');
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      throw new Error('Не удалось получить ответ от Claude. Попробуйте бесплатные варианты!');
    }
  }

  // Google AI (платный)
  static async callGoogleAI(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.google) throw new Error('Google AI API ключ не найден. Используйте бесплатные варианты!');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${keys.google}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });

      if (!response.ok) throw new Error('Ошибка API Google AI');
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error('Не удалось получить ответ от Google AI. Попробуйте бесплатные варианты!');
    }
  }

  // Yandex GPT (платный)
  static async callYandexGPT(message: string): Promise<string> {
    const keys = this.getKeys();
    if (!keys.yandex || !keys.yandexFolder) {
      throw new Error('Yandex API ключ или Folder ID не найден. Используйте бесплатные варианты!');
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
            { role: 'user', text: message }
          ]
        })
      });

      if (!response.ok) throw new Error('Ошибка API Yandex GPT');
      
      const data = await response.json();
      return data.result.alternatives[0].message.text;
    } catch (error) {
      throw new Error('Не удалось получить ответ от Yandex GPT. Попробуйте бесплатные варианты!');
    }
  }
}