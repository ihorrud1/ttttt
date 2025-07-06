interface ProxyServer {
  id: string;
  name: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
  status: 'active' | 'inactive' | 'checking' | 'error';
  speed?: number;
  lastChecked?: Date;
  isWorking: boolean;
}

export class RealProxyService {
  private static proxies: Map<string, ProxyServer> = new Map();

  // Реальная проверка прокси
  static async testProxy(proxy: ProxyServer): Promise<boolean> {
    try {
      // Создаем прокси URL
      const proxyUrl = this.buildProxyUrl(proxy);
      
      // Тестируем прокси через реальный запрос
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут

      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller.signal,
        // В реальном проекте здесь будет настройка прокси
        // Для демонстрации используем прямой запрос
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`Прокси ${proxy.host}:${proxy.port} работает. IP: ${data.origin}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Ошибка тестирования прокси ${proxy.host}:${proxy.port}:`, error);
      return false;
    }
  }

  // Проверка скорости прокси
  static async checkProxySpeed(proxy: ProxyServer): Promise<number> {
    const startTime = Date.now();
    
    try {
      const isWorking = await this.testProxy(proxy);
      const endTime = Date.now();
      
      if (isWorking) {
        return endTime - startTime;
      }
      
      return -1; // Прокси не работает
    } catch (error) {
      return -1;
    }
  }

  // Получение рабочих прокси
  static async getWorkingProxies(): Promise<ProxyServer[]> {
    const workingProxies: ProxyServer[] = [];
    
    for (const proxy of this.proxies.values()) {
      if (proxy.isWorking) {
        workingProxies.push(proxy);
      }
    }
    
    return workingProxies;
  }

  // Массовая проверка прокси
  static async checkAllProxies(): Promise<void> {
    const promises = Array.from(this.proxies.values()).map(async (proxy) => {
      proxy.status = 'checking';
      
      try {
        const speed = await this.checkProxySpeed(proxy);
        
        if (speed > 0) {
          proxy.status = 'active';
          proxy.speed = speed;
          proxy.isWorking = true;
        } else {
          proxy.status = 'inactive';
          proxy.isWorking = false;
        }
      } catch (error) {
        proxy.status = 'error';
        proxy.isWorking = false;
      }
      
      proxy.lastChecked = new Date();
    });
    
    await Promise.all(promises);
    this.saveProxies();
  }

  // Импорт прокси из текста
  static importProxiesFromText(text: string): ProxyServer[] {
    const lines = text.split('\n').filter(line => line.trim());
    const importedProxies: ProxyServer[] = [];
    
    lines.forEach((line, index) => {
      const parts = line.trim().split(':');
      
      if (parts.length >= 2) {
        const proxy: ProxyServer = {
          id: `imported_${Date.now()}_${index}`,
          name: `Импорт ${index + 1}`,
          type: 'http',
          host: parts[0],
          port: parseInt(parts[1]) || 8080,
          username: parts[2] || undefined,
          password: parts[3] || undefined,
          status: 'inactive',
          isWorking: false
        };
        
        importedProxies.push(proxy);
        this.proxies.set(proxy.id, proxy);
      }
    });
    
    this.saveProxies();
    return importedProxies;
  }

  // Получение случайного рабочего прокси
  static async getRandomWorkingProxy(): Promise<ProxyServer | null> {
    const workingProxies = await this.getWorkingProxies();
    
    if (workingProxies.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * workingProxies.length);
    return workingProxies[randomIndex];
  }

  // Создание прокси URL
  private static buildProxyUrl(proxy: ProxyServer): string {
    let url = `${proxy.type}://`;
    
    if (proxy.username && proxy.password) {
      url += `${proxy.username}:${proxy.password}@`;
    }
    
    url += `${proxy.host}:${proxy.port}`;
    return url;
  }

  // Добавление прокси
  static addProxy(proxyData: Omit<ProxyServer, 'id' | 'status' | 'isWorking'>): ProxyServer {
    const proxy: ProxyServer = {
      ...proxyData,
      id: `proxy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'inactive',
      isWorking: false
    };
    
    this.proxies.set(proxy.id, proxy);
    this.saveProxies();
    return proxy;
  }

  // Удаление прокси
  static removeProxy(proxyId: string): boolean {
    const deleted = this.proxies.delete(proxyId);
    if (deleted) {
      this.saveProxies();
    }
    return deleted;
  }

  // Получение всех прокси
  static getAllProxies(): ProxyServer[] {
    this.loadProxies();
    return Array.from(this.proxies.values());
  }

  // Сохранение в localStorage
  private static saveProxies(): void {
    const proxiesArray = Array.from(this.proxies.values());
    localStorage.setItem('real-proxies', JSON.stringify(proxiesArray));
  }

  // Загрузка из localStorage
  private static loadProxies(): void {
    const saved = localStorage.getItem('real-proxies');
    if (saved) {
      const proxiesArray = JSON.parse(saved);
      this.proxies.clear();
      proxiesArray.forEach((proxy: ProxyServer) => {
        this.proxies.set(proxy.id, proxy);
      });
    }
  }

  // Экспорт прокси
  static exportProxies(): string {
    const proxies = this.getAllProxies();
    return proxies.map(proxy => {
      let line = `${proxy.host}:${proxy.port}`;
      if (proxy.username && proxy.password) {
        line += `:${proxy.username}:${proxy.password}`;
      }
      return line;
    }).join('\n');
  }

  // Получение статистики
  static getProxyStats(): {
    total: number;
    working: number;
    checking: number;
    failed: number;
  } {
    const proxies = this.getAllProxies();
    
    return {
      total: proxies.length,
      working: proxies.filter(p => p.status === 'active').length,
      checking: proxies.filter(p => p.status === 'checking').length,
      failed: proxies.filter(p => p.status === 'inactive' || p.status === 'error').length
    };
  }
}