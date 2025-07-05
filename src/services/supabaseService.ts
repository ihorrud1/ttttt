import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface MonetizationBot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'paused';
  target_site: string;
  visit_count: number;
  last_visit: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  settings?: BotSettings;
  stats?: BotStats;
}

export interface BotSettings {
  id: string;
  bot_id: string;
  visit_interval_min: number;
  visit_interval_max: number;
  ad_types: string[];
  human_behavior: boolean;
  anti_captcha: boolean;
  user_agent: string;
  proxy_enabled: boolean;
  proxy_host?: string;
  proxy_port?: number;
  proxy_username?: string;
  proxy_password?: string;
  dns_servers: string[];
  webrtc_mode: 'disabled' | 'fake' | 'real';
  fingerprint_enabled: boolean;
}

export interface BotStats {
  id: string;
  bot_id: string;
  total_visits: number;
  ads_viewed: number;
  banners_clicked: number;
  videos_watched: number;
  earnings: number;
  last_updated: string;
}

export interface BotLog {
  id: string;
  bot_id: string;
  bot_name: string;
  log_type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  metadata: any;
  created_at: string;
}

export interface ProxyServer {
  id: string;
  name: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
  status: 'active' | 'inactive' | 'checking';
  speed?: number;
  last_checked?: string;
  is_used: boolean;
  user_id: string;
}

export interface UserAgent {
  id: string;
  user_agent: string;
  browser: string;
  os: string;
  is_mobile: boolean;
  is_used: boolean;
}

export interface Fingerprint {
  id: string;
  canvas_hash: string;
  webgl_hash: string;
  audio_hash: string;
  screen_width: number;
  screen_height: number;
  color_depth: number;
  timezone: string;
  language: string;
  platform: string;
  is_used: boolean;
  user_id: string;
}

export class SupabaseBotService {
  // Получить всех ботов пользователя
  static async getAllBots(): Promise<MonetizationBot[]> {
    const { data, error } = await supabase
      .from('monetization_bots')
      .select(`
        *,
        settings:bot_settings(*),
        stats:bot_stats(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Создать нового бота
  static async createBot(botData: Partial<MonetizationBot>): Promise<MonetizationBot> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    // Создаем бота
    const { data: bot, error: botError } = await supabase
      .from('monetization_bots')
      .insert({
        name: botData.name,
        target_site: botData.target_site || '',
        user_id: user.id
      })
      .select()
      .single();

    if (botError) throw botError;

    // Создаем настройки бота
    const { error: settingsError } = await supabase
      .from('bot_settings')
      .insert({
        bot_id: bot.id,
        visit_interval_min: 30,
        visit_interval_max: 120,
        ad_types: ['banner', 'video'],
        human_behavior: true,
        anti_captcha: true,
        user_agent: await this.getRandomUserAgent(),
        proxy_enabled: false,
        dns_servers: ['8.8.8.8', '1.1.1.1'],
        webrtc_mode: 'disabled',
        fingerprint_enabled: false
      });

    if (settingsError) throw settingsError;

    // Создаем статистику бота
    const { error: statsError } = await supabase
      .from('bot_stats')
      .insert({
        bot_id: bot.id,
        total_visits: 0,
        ads_viewed: 0,
        banners_clicked: 0,
        videos_watched: 0,
        earnings: 0
      });

    if (statsError) throw statsError;

    return bot;
  }

  // Обновить бота
  static async updateBot(botId: string, updates: Partial<MonetizationBot>): Promise<void> {
    const { error } = await supabase
      .from('monetization_bots')
      .update(updates)
      .eq('id', botId);

    if (error) throw error;
  }

  // Удалить бота
  static async deleteBot(botId: string): Promise<void> {
    const { error } = await supabase
      .from('monetization_bots')
      .delete()
      .eq('id', botId);

    if (error) throw error;
  }

  // Обновить настройки бота
  static async updateBotSettings(botId: string, settings: Partial<BotSettings>): Promise<void> {
    const { error } = await supabase
      .from('bot_settings')
      .update(settings)
      .eq('bot_id', botId);

    if (error) throw error;
  }

  // Обновить статистику бота
  static async updateBotStats(botId: string, stats: Partial<BotStats>): Promise<void> {
    const { error } = await supabase
      .from('bot_stats')
      .update({
        ...stats,
        last_updated: new Date().toISOString()
      })
      .eq('bot_id', botId);

    if (error) throw error;
  }

  // Добавить лог
  static async addBotLog(log: Omit<BotLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('bot_logs')
      .insert(log);

    if (error) throw error;
  }

  // Получить логи бота
  static async getBotLogs(botId?: string, limit = 100): Promise<BotLog[]> {
    let query = supabase
      .from('bot_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (botId) {
      query = query.eq('bot_id', botId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Получить прокси серверы
  static async getProxyServers(): Promise<ProxyServer[]> {
    const { data, error } = await supabase
      .from('proxy_servers')
      .select('*')
      .eq('is_used', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Создать прокси сервер
  static async createProxyServer(proxy: Omit<ProxyServer, 'id' | 'created_at' | 'user_id' | 'is_used'>): Promise<ProxyServer> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { data, error } = await supabase
      .from('proxy_servers')
      .insert({
        ...proxy,
        user_id: user.id,
        is_used: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Пометить прокси как использованный
  static async markProxyAsUsed(proxyId: string): Promise<void> {
    const { error } = await supabase
      .from('proxy_servers')
      .update({ is_used: true })
      .eq('id', proxyId);

    if (error) throw error;
  }

  // Получить случайный User Agent
  static async getRandomUserAgent(): Promise<string> {
    const { data, error } = await supabase
      .from('user_agents')
      .select('user_agent')
      .eq('is_used', false)
      .limit(1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0].user_agent;
    }

    // Fallback если нет доступных User Agent'ов
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  // Создать отпечаток браузера
  static async createFingerprint(): Promise<Fingerprint> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const fingerprint = {
      canvas_hash: Math.random().toString(36).substring(2),
      webgl_hash: Math.random().toString(36).substring(2),
      audio_hash: Math.random().toString(36).substring(2),
      screen_width: 1920 + Math.floor(Math.random() * 400),
      screen_height: 1080 + Math.floor(Math.random() * 200),
      color_depth: [24, 32][Math.floor(Math.random() * 2)],
      timezone: 'Europe/Moscow',
      language: 'ru-RU',
      platform: 'Win32',
      is_used: false,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('fingerprints')
      .insert(fingerprint)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Добавить запись о заработке
  static async addEarning(botId: string, amount: number, type: string, siteUrl: string): Promise<void> {
    const { error } = await supabase
      .from('earnings_history')
      .insert({
        bot_id: botId,
        amount,
        earning_type: type,
        site_url: siteUrl
      });

    if (error) throw error;
  }

  // Получить общую статистику
  static async getTotalStats(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    // Получаем общую статистику по всем ботам пользователя
    const { data, error } = await supabase
      .from('bot_stats')
      .select(`
        total_visits,
        ads_viewed,
        banners_clicked,
        videos_watched,
        earnings,
        monetization_bots!inner(user_id)
      `)
      .eq('monetization_bots.user_id', user.id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalVisits: 0,
        adsViewed: 0,
        bannersClicked: 0,
        videosWatched: 0,
        earnings: 0
      };
    }

    return data.reduce((acc, stat) => ({
      totalVisits: acc.totalVisits + stat.total_visits,
      adsViewed: acc.adsViewed + stat.ads_viewed,
      bannersClicked: acc.bannersClicked + stat.banners_clicked,
      videosWatched: acc.videosWatched + stat.videos_watched,
      earnings: acc.earnings + parseFloat(stat.earnings.toString())
    }), {
      totalVisits: 0,
      adsViewed: 0,
      bannersClicked: 0,
      videosWatched: 0,
      earnings: 0
    });
  }

  // Получить историю заработков
  static async getEarningsHistory(botId?: string, days = 7): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('earnings_history')
      .select(`
        *,
        monetization_bots!inner(user_id)
      `)
      .eq('monetization_bots.user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (botId) {
      query = query.eq('bot_id', botId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Очистить использованные ресурсы
  static async cleanupUsedResources(): Promise<void> {
    // Сбрасываем флаг использования для User Agent'ов (каждые 24 часа)
    await supabase
      .from('user_agents')
      .update({ is_used: false })
      .eq('is_used', true);

    // Удаляем использованные прокси
    await supabase
      .from('proxy_servers')
      .delete()
      .eq('is_used', true);

    // Удаляем использованные отпечатки
    await supabase
      .from('fingerprints')
      .delete()
      .eq('is_used', true);
  }

  // Проверить подключение к Supabase
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('monetization_bots')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }
}