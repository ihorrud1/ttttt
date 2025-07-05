interface MonetizationBot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'paused';
  targetSite: string;
  visitCount: number;
  lastVisit: Date;
  settings: {
    visitInterval: { min: number; max: number };
    adTypes: string[];
    humanBehavior: boolean;
    antiCaptcha: boolean;
    userAgent: string;
    proxy: any;
    dns: string[];
    webrtc: any;
    fingerprint: any;
  };
  stats: {
    totalVisits: number;
    adsViewed: number;
    bannersClicked: number;
    videosWatched: number;
    earnings: number;
  };
}

export class BotService {
  private static bots: MonetizationBot[] = [];
  private static runningBots: Map<string, any> = new Map();

  static async getAllBots(): Promise<MonetizationBot[]> {
    // Загружаем ботов из localStorage
    const saved = localStorage.getItem('monetization-bots');
    if (saved) {
      this.bots = JSON.parse(saved);
    }
    return this.bots;
  }

  static async createBot(botData: Partial<MonetizationBot>): Promise<MonetizationBot> {
    const newBot: MonetizationBot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name || `Бот-${Date.now()}`,
      status: 'stopped',
      targetSite: botData.targetSite || '',
      visitCount: 0,
      lastVisit: new Date(),
      settings: {
        visitInterval: { min: 30, max: 120 },
        adTypes: ['banner', 'video'],
        humanBehavior: true,
        antiCaptcha: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        proxy: null,
        dns: ['8.8.8.8', '1.1.1.1'],
        webrtc: { mode: 'disabled' },
        fingerprint: null,
        ...botData.settings
      },
      stats: {
        totalVisits: 0,
        adsViewed: 0,
        bannersClicked: 0,
        videosWatched: 0,
        earnings: 0
      }
    };

    this.bots.push(newBot);
    this.saveBots();
    return newBot;
  }

  static async startBot(botId: string): Promise<void> {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) throw new Error('Бот не найден');

    if (this.runningBots.has(botId)) {
      throw new Error('Бот уже запущен');
    }

    // Проверяем настройки бота
    if (!bot.targetSite) {
      throw new Error('Не указан целевой сайт');
    }

    // Проверяем прокси если включен
    if (bot.settings.proxy) {
      const proxyValid = await this.validateProxy(bot.settings.proxy);
      if (!proxyValid) {
        bot.status = 'error';
        this.saveBots();
        throw new Error('Прокси недоступен');
      }
    }

    // Проверяем DNS
    const dnsValid = await this.validateDNS(bot.settings.dns);
    if (!dnsValid) {
      bot.status = 'error';
      this.saveBots();
      throw new Error('DNS серверы недоступны');
    }

    // Запускаем бота
    bot.status = 'running';
    const interval = setInterval(() => {
      this.performBotAction(bot);
    }, this.getRandomInterval(bot.settings.visitInterval));

    this.runningBots.set(botId, interval);
    this.saveBots();
  }

  static async stopBot(botId: string): Promise<void> {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) throw new Error('Бот не найден');

    const interval = this.runningBots.get(botId);
    if (interval) {
      clearInterval(interval);
      this.runningBots.delete(botId);
    }

    bot.status = 'stopped';
    this.saveBots();
  }

  static async deleteBot(botId: string): Promise<void> {
    await this.stopBot(botId);
    this.bots = this.bots.filter(b => b.id !== botId);
    this.saveBots();
  }

  private static async performBotAction(bot: MonetizationBot): Promise<void> {
    try {
      // Симуляция посещения сайта
      console.log(`[${bot.name}] Посещение сайта: ${bot.targetSite}`);
      
      // Проверяем прокси и DNS перед каждым действием
      if (bot.settings.proxy) {
        const proxyValid = await this.validateProxy(bot.settings.proxy);
        if (!proxyValid) {
          console.log(`[${bot.name}] Прокси недоступен, останавливаем бота`);
          await this.stopBot(bot.id);
          return;
        }
      }

      // Проверяем WebRTC утечки
      if (bot.settings.webrtc.mode === 'disabled') {
        console.log(`[${bot.name}] WebRTC заблокирован`);
      }

      // Имитация человеческого поведения
      if (bot.settings.humanBehavior) {
        await this.simulateHumanBehavior();
      }

      // Просмотр рекламы
      const adViewed = await this.viewAdvertisement(bot);
      if (adViewed) {
        bot.stats.adsViewed++;
        
        // Случайный клик по рекламе
        if (Math.random() < 0.15) { // 15% вероятность клика
          bot.stats.bannersClicked++;
          bot.stats.earnings += Math.random() * 0.1 + 0.02; // $0.02-$0.12 за клик
          console.log(`[${bot.name}] Кликнул по рекламе, заработано: $${(Math.random() * 0.1 + 0.02).toFixed(3)}`);
        }

        // Просмотр видеорекламы
        if (bot.settings.adTypes.includes('video') && Math.random() < 0.3) {
          bot.stats.videosWatched++;
          bot.stats.earnings += Math.random() * 0.05 + 0.01; // $0.01-$0.06 за видео
          console.log(`[${bot.name}] Просмотрел видеорекламу`);
        }
      }

      // Обновляем статистику
      bot.stats.totalVisits++;
      bot.visitCount++;
      bot.lastVisit = new Date();

      // Проверяем на капчу
      if (bot.settings.antiCaptcha && Math.random() < 0.05) { // 5% вероятность капчи
        console.log(`[${bot.name}] Обнаружена капча, решаем...`);
        await this.solveCaptcha();
        console.log(`[${bot.name}] Капча решена`);
      }

      this.saveBots();

    } catch (error) {
      console.error(`[${bot.name}] Ошибка:`, error);
      bot.status = 'error';
      await this.stopBot(bot.id);
    }
  }

  private static async validateProxy(proxy: any): Promise<boolean> {
    // Симуляция проверки прокси
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% успешных проверок
      }, 1000);
    });
  }

  private static async validateDNS(dnsServers: string[]): Promise<boolean> {
    // Симуляция проверки DNS
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.05); // 95% успешных проверок
      }, 500);
    });
  }

  private static async simulateHumanBehavior(): Promise<void> {
    // Симуляция человеческого поведения
    const actions = [
      'Движение мыши',
      'Скроллинг страницы',
      'Пауза для чтения',
      'Случайный клик',
      'Изменение размера окна'
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    console.log(`Имитация: ${action}`);
    
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 2000 + 500); // 0.5-2.5 секунды
    });
  }

  private static async viewAdvertisement(bot: MonetizationBot): Promise<boolean> {
    // Симуляция просмотра рекламы
    const adTypes = bot.settings.adTypes;
    if (adTypes.length === 0) return false;

    const randomAdType = adTypes[Math.floor(Math.random() * adTypes.length)];
    console.log(`[${bot.name}] Просмотр рекламы типа: ${randomAdType}`);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.2); // 80% успешных просмотров
      }, Math.random() * 3000 + 1000); // 1-4 секунды
    });
  }

  private static async solveCaptcha(): Promise<void> {
    // Симуляция решения капчи
    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 5000 + 2000); // 2-7 секунд
    });
  }

  private static getRandomInterval(interval: { min: number; max: number }): number {
    return (Math.random() * (interval.max - interval.min) + interval.min) * 1000;
  }

  private static saveBots(): void {
    localStorage.setItem('monetization-bots', JSON.stringify(this.bots));
  }

  // Метод для получения одноразовых ресурсов
  static async getOneTimeResources(botId: string): Promise<any> {
    const resources = {
      proxy: await this.getRandomProxy(),
      userAgent: this.getRandomUserAgent(),
      fingerprint: this.generateFingerprint(),
      cookies: this.generateCookies()
    };

    // После использования ресурсы помечаются как использованные
    setTimeout(() => {
      this.markResourcesAsUsed(resources);
    }, 60000); // Через минуту ресурсы удаляются

    return resources;
  }

  private static async getRandomProxy(): Promise<any> {
    // Получаем случайный прокси из базы
    const proxies = JSON.parse(localStorage.getItem('proxies') || '[]');
    return proxies[Math.floor(Math.random() * proxies.length)];
  }

  private static getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private static generateFingerprint(): any {
    return {
      canvas: Math.random().toString(36),
      webgl: Math.random().toString(36),
      audio: Math.random().toString(36),
      screen: {
        width: 1920 + Math.floor(Math.random() * 400),
        height: 1080 + Math.floor(Math.random() * 200),
        colorDepth: [24, 32][Math.floor(Math.random() * 2)]
      }
    };
  }

  private static generateCookies(): any[] {
    return [
      { name: 'session_id', value: Math.random().toString(36) },
      { name: 'user_pref', value: Math.random().toString(36) },
      { name: 'tracking_id', value: Math.random().toString(36) }
    ];
  }

  private static markResourcesAsUsed(resources: any): void {
    // Помечаем ресурсы как использованные и удаляем их
    console.log('Ресурсы помечены как использованные и удалены');
  }
}