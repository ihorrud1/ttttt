export interface Bot {
  id: string;
  name: string;
  type: 'discord' | 'telegram' | 'slack' | 'custom';
  status: 'online' | 'offline' | 'error' | 'starting';
  createdAt: Date;
  lastActivity: Date;
  messagesProcessed: number;
  uptime: number;
  version: string;
  description?: string;
  avatar?: string;
  
  // Продвинутые настройки
  proxy: ProxySettings;
  browser: BrowserSettings;
  behavior: BehaviorSettings;
  advertising: AdvertisingSettings;
}

export interface ProxySettings {
  enabled: boolean;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  rotation: boolean;
  rotationInterval: number; // минуты
}

export interface BrowserSettings {
  userAgent: string;
  webrtc: WebRTCSettings;
  fingerprint: FingerprintSettings;
  dns: DNSSettings;
  headers: Record<string, string>;
}

export interface WebRTCSettings {
  mode: 'disabled' | 'fake' | 'real';
  fakeIP?: string;
  stunServers: string[];
}

export interface FingerprintSettings {
  canvas: boolean;
  webgl: boolean;
  audio: boolean;
  fonts: string[];
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
}

export interface DNSSettings {
  servers: string[];
  dohEnabled: boolean;
  dohUrl?: string;
}

export interface BehaviorSettings {
  clickDelay: {
    min: number;
    max: number;
  };
  scrollSpeed: number;
  typingSpeed: {
    min: number;
    max: number;
  };
  pauseBetweenActions: {
    min: number;
    max: number;
  };
  humanLikeMovement: boolean;
  randomBreaks: boolean;
  breakInterval: {
    min: number;
    max: number;
  };
}

export interface AdvertisingSettings {
  viewAds: boolean;
  adTypes: AdType[];
  clickRate: number; // процент кликов на рекламу
  viewDuration: {
    min: number;
    max: number;
  };
  skipRate: number; // процент пропуска рекламы
  interactionPatterns: InteractionPattern[];
}

export interface AdType {
  type: 'banner' | 'video' | 'popup' | 'native' | 'interstitial';
  enabled: boolean;
  priority: number;
}

export interface InteractionPattern {
  name: string;
  description: string;
  actions: BotAction[];
}

export interface BotAction {
  type: 'click' | 'scroll' | 'wait' | 'type' | 'hover';
  target?: string;
  value?: string;
  delay?: number;
}

export interface BotStats {
  total: number;
  online: number;
  offline: number;
  error: number;
  totalMessages: number;
  averageUptime: number;
}