import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import { SupabaseBotService, BotLog } from '../services/supabaseService';

interface BotTerminalProps {
  bots: any[];
}

export default function BotTerminal({ bots }: BotTerminalProps) {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogs();
    
    // Обновляем логи каждые 5 секунд
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const loadLogs = async () => {
    try {
      const data = await SupabaseBotService.getBotLogs();
      setLogs(data);
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    }
  };

  const clearLogs = async () => {
    if (confirm('Очистить все логи из базы данных?')) {
      try {
        // В реальном приложении здесь будет метод для очистки логов
        setLogs([]);
      } catch (error) {
        console.error('Ошибка очистки логов:', error);
      }
    }
  };

  const getLogIcon = (type: BotLog['log_type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: BotLog['log_type']) => {
    switch (type) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'error': return 'text-red-700';
      default: return 'text-blue-700';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.log_type === filter);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Терминал ботов</h2>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              Supabase Logs
            </span>
            <Database className="w-5 h-5 text-blue-600" />
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
              onClick={loadLogs}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : 'Обновить'}
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
            <Database className="w-8 h-8 mx-auto mb-2" />
            Логи отсутствуют в базе данных. Запустите ботов для просмотра активности.
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1">
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                
                <span className="text-blue-400 text-xs min-w-0 truncate">
                  [{log.bot_name}]
                </span>
                
                <div className="flex items-center gap-1">
                  {getLogIcon(log.log_type)}
                </div>
                
                <span className={`flex-1 ${getLogColor(log.log_type)}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Всего логов в БД: {logs.length}</span>
            <span>Отфильтровано: {filteredLogs.length}</span>
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Данные из Supabase</span>
            </div>
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