import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TerminalLog {
  id: string;
  timestamp: Date;
  botId: string;
  botName: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface BotTerminalProps {
  bots: any[];
}

export default function BotTerminal({ bots }: BotTerminalProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Симуляция логов в реальном времени
    const interval = setInterval(() => {
      if (bots.length > 0) {
        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        if (randomBot.status === 'running') {
          addLog(generateRandomLog(randomBot));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bots]);

  useEffect(() => {
    if (isAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const generateRandomLog = (bot: any): TerminalLog => {
    const logTypes = [
      { type: 'info', message: `Переход на сайт ${bot.targetSite}` },
      { type: 'success', message: 'Успешно просмотрел баннерную рекламу' },
      { type: 'success', message: 'Кликнул по рекламному баннеру' },
      { type: 'info', message: 'Запуск видеорекламы' },
      { type: 'success', message: 'Видеореклама просмотрена до конца' },
      { type: 'warning', message: 'Обнаружена капча, обходим...' },
      { type: 'success', message: 'Капча успешно решена' },
      { type: 'info', message: 'Имитация человеческого поведения' },
      { type: 'info', message: 'Смена User Agent' },
      { type: 'warning', message: 'Прокси медленно отвечает' },
      { type: 'error', message: 'Прокси недоступен, переключение...' },
      { type: 'success', message: 'Подключен новый прокси' },
      { type: 'info', message: 'DNS запрос выполнен' },
      { type: 'warning', message: 'WebRTC утечка обнаружена, блокируем' },
      { type: 'success', message: 'Заработано $0.05 за просмотр рекламы' }
    ];

    const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)];
    
    return {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      botId: bot.id,
      botName: bot.name,
      type: randomLog.type as any,
      message: randomLog.message
    };
  };

  const addLog = (log: TerminalLog) => {
    setLogs(prev => [...prev.slice(-99), log]); // Храним последние 100 логов
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'error': return 'text-red-700';
      default: return 'text-blue-700';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Терминал ботов</h2>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              Реальное время
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">Все логи</option>
              <option value="info">Информация</option>
              <option value="success">Успех</option>
              <option value="warning">Предупреждения</option>
              <option value="error">Ошибки</option>
            </select>
            
            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`px-3 py-1 rounded text-sm ${
                isAutoScroll ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isAutoScroll ? 'Авто-скролл ВКЛ' : 'Авто-скролл ВЫКЛ'}
            </button>
            
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
            >
              Очистить
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="h-96 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm p-4"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Логи отсутствуют. Запустите ботов для просмотра активности.
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1">
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                
                <span className="text-blue-400 text-xs min-w-0 truncate">
                  [{log.botName}]
                </span>
                
                <div className="flex items-center gap-1">
                  {getLogIcon(log.type)}
                </div>
                
                <span className={`flex-1 ${getLogColor(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Всего логов: {logs.length} | Отфильтровано: {filteredLogs.length}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Активных ботов: {bots.filter(bot => bot.status === 'running').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Остановлено: {bots.filter(bot => bot.status === 'stopped').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}