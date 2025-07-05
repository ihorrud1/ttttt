/*
  # Создание схемы для ИИ администратора ботов монетизации

  1. Новые таблицы
    - `monetization_bots` - основная таблица ботов
    - `bot_settings` - настройки ботов
    - `bot_stats` - статистика ботов
    - `bot_logs` - логи активности ботов
    - `proxy_servers` - прокси серверы
    - `user_agents` - пул User Agent'ов
    - `fingerprints` - отпечатки браузеров
    - `ad_campaigns` - рекламные кампании
    - `earnings_history` - история заработков

  2. Безопасность
    - Включен RLS для всех таблиц
    - Политики доступа для аутентифицированных пользователей
*/

-- Таблица ботов для монетизации
CREATE TABLE IF NOT EXISTS monetization_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'error', 'paused')),
  target_site text NOT NULL,
  visit_count integer DEFAULT 0,
  last_visit timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Настройки ботов
CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES monetization_bots(id) ON DELETE CASCADE,
  visit_interval_min integer DEFAULT 30,
  visit_interval_max integer DEFAULT 120,
  ad_types text[] DEFAULT ARRAY['banner', 'video'],
  human_behavior boolean DEFAULT true,
  anti_captcha boolean DEFAULT true,
  user_agent text,
  proxy_enabled boolean DEFAULT false,
  proxy_host text,
  proxy_port integer,
  proxy_username text,
  proxy_password text,
  dns_servers text[] DEFAULT ARRAY['8.8.8.8', '1.1.1.1'],
  webrtc_mode text DEFAULT 'disabled' CHECK (webrtc_mode IN ('disabled', 'fake', 'real')),
  fingerprint_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Статистика ботов
CREATE TABLE IF NOT EXISTS bot_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES monetization_bots(id) ON DELETE CASCADE,
  total_visits integer DEFAULT 0,
  ads_viewed integer DEFAULT 0,
  banners_clicked integer DEFAULT 0,
  videos_watched integer DEFAULT 0,
  earnings decimal(10,4) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Логи активности ботов
CREATE TABLE IF NOT EXISTS bot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES monetization_bots(id) ON DELETE CASCADE,
  bot_name text NOT NULL,
  log_type text NOT NULL CHECK (log_type IN ('info', 'success', 'warning', 'error')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Прокси серверы
CREATE TABLE IF NOT EXISTS proxy_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('http', 'https', 'socks4', 'socks5')),
  host text NOT NULL,
  port integer NOT NULL,
  username text,
  password text,
  country text,
  status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'checking')),
  speed integer,
  last_checked timestamptz,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Пул User Agent'ов
CREATE TABLE IF NOT EXISTS user_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text NOT NULL UNIQUE,
  browser text NOT NULL,
  os text NOT NULL,
  is_mobile boolean DEFAULT false,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Отпечатки браузеров
CREATE TABLE IF NOT EXISTS fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_hash text NOT NULL,
  webgl_hash text NOT NULL,
  audio_hash text NOT NULL,
  screen_width integer NOT NULL,
  screen_height integer NOT NULL,
  color_depth integer NOT NULL,
  timezone text NOT NULL,
  language text NOT NULL,
  platform text NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Рекламные кампании
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  site_url text NOT NULL,
  ad_types text[] NOT NULL,
  cpm_rate decimal(6,4) DEFAULT 0,
  cpc_rate decimal(6,4) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- История заработков
CREATE TABLE IF NOT EXISTS earnings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES monetization_bots(id) ON DELETE CASCADE,
  amount decimal(10,4) NOT NULL,
  earning_type text NOT NULL CHECK (earning_type IN ('banner_click', 'video_view', 'popup_view', 'native_click')),
  site_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE monetization_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxy_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_history ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для ботов
CREATE POLICY "Users can manage their own bots"
  ON monetization_bots
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their bot settings"
  ON bot_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM monetization_bots 
    WHERE id = bot_settings.bot_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view their bot stats"
  ON bot_stats
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM monetization_bots 
    WHERE id = bot_stats.bot_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view their bot logs"
  ON bot_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM monetization_bots 
    WHERE id = bot_logs.bot_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their proxy servers"
  ON proxy_servers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "All users can read user agents"
  ON user_agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their fingerprints"
  ON fingerprints
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their ad campaigns"
  ON ad_campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their earnings history"
  ON earnings_history
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM monetization_bots 
    WHERE id = earnings_history.bot_id AND user_id = auth.uid()
  ));

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_monetization_bots_user_id ON monetization_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_monetization_bots_status ON monetization_bots(status);
CREATE INDEX IF NOT EXISTS idx_bot_settings_bot_id ON bot_settings(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_stats_bot_id ON bot_stats(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_bot_id ON bot_logs(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_proxy_servers_user_id ON proxy_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_proxy_servers_status ON proxy_servers(status);
CREATE INDEX IF NOT EXISTS idx_fingerprints_user_id ON fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_bot_id ON earnings_history(bot_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_created_at ON earnings_history(created_at);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_monetization_bots_updated_at
  BEFORE UPDATE ON monetization_bots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_settings_updated_at
  BEFORE UPDATE ON bot_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Заполняем базовые User Agent'ы
INSERT INTO user_agents (user_agent, browser, os, is_mobile) VALUES
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Chrome', 'Windows', false),
('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Chrome', 'macOS', false),
('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Chrome', 'Linux', false),
('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0', 'Firefox', 'Windows', false),
('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0', 'Firefox', 'macOS', false),
('Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1', 'Safari', 'iOS', true),
('Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1', 'Safari', 'iOS', true),
('Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 'Chrome', 'Android', true)
ON CONFLICT (user_agent) DO NOTHING;