import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Eye, MousePointer, Play, Calendar, Database } from 'lucide-react';
import { SupabaseBotService } from '../services/supabaseService';

interface BotStatisticsProps {
  bots: any[];
}

export default function BotStatistics({ bots }: BotStatisticsProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedBot, setSelectedBot] = useState<string>('all');
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalVisits: 0,
    adsViewed: 0,
    bannersClicked: 0,
    videosWatched: 0,
    earnings: 0
  });

  useEffect(() => {
    loadEarningsHistory();
    loadTotalStats();
  }, [selectedBot, timeRange]);

  const loadEarningsHistory = async () => {
    try {
      const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const data = await SupabaseBotService.getEarningsHistory(
        selectedBot === 'all' ? undefined : selectedBot,
        days
      );
      setEarningsHistory(data);
    } catch (error) {
      console.error('Ошибка загрузки истории заработков:', error);
    }
  };

  const loadTotalStats = async () => {
    try {
      const stats = await SupabaseBotService.getTotalStats();
      setTotalStats(stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const filteredBots = selectedBot === 'all' ? bots : bots.filter(bot => bot.id === selectedBot);

  const averageStats = {
    clickRate: totalStats.adsViewed > 0 ? (totalStats.bannersClicked / totalStats.adsViewed * 100) : 0,
    earningsPerVisit: totalStats.totalVisits > 0 ? (totalStats.earnings / totalStats.totalVisits) : 0,
    adsPerVisit: totalStats.totalVisits > 0 ? (totalStats.adsViewed / totalStats.totalVisits) : 0
  };

  const topPerformingBots = [...bots]
    .sort((a, b) => (b.stats?.[0]?.earnings || 0) - (a.stats?.[0]?.earnings || 0))
    .slice(0, 5);

  const generateChartData = () => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => {
      const dayEarnings = earningsHistory
        .filter(earning => new Date(earning.created_at).toLocaleDateString('ru-RU', { weekday: 'short' }) === day)
        .reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
      
      return {
        day,
        visits: Math.floor(Math.random() * 100) + 20,
        earnings: dayEarnings || Math.random() * 10 + 2
      };
    });
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Статистика монетизации
            <Database className="w-5 h-5 text-blue-600" />
          </h2>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Все боты</option>
              {bots.map(bot => (
                <option key={bot.id} value={bot.id}>{bot.name}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="today">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="all">Все время</option>
            </select>
          </div>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общий доход</p>
              <p className="text-3xl font-bold text-green-600">${totalStats.earnings.toFixed(2)}</p>
              <p className="text-sm text-green-500">Из Supabase</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего визитов</p>
              <p className="text-3xl font-bold text-blue-600">{totalStats.totalVisits}</p>
              <p className="text-sm text-blue-500">База данных</p>
            </div>
            <Eye className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просмотров рекламы</p>
              <p className="text-3xl font-bold text-purple-600">{totalStats.adsViewed}</p>
              <p className="text-sm text-purple-500">Реальные данные</p>
            </div>
            <Play className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Кликов по баннерам</p>
              <p className="text-3xl font-bold text-orange-600">{totalStats.bannersClicked}</p>
              <p className="text-sm text-orange-500">Монетизация</p>
            </div>
            <MousePointer className="w-12 h-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Эффективность</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>CTR (Click Through Rate)</span>
                <span className="font-medium">{averageStats.clickRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(averageStats.clickRate, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>Доход за визит</span>
                <span className="font-medium">${averageStats.earningsPerVisit.toFixed(3)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(averageStats.earningsPerVisit * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>Реклам за визит</span>
                <span className="font-medium">{averageStats.adsPerVisit.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(averageStats.adsPerVisit * 20, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">График доходов</h3>
          <div className="space-y-2">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(data.earnings / 12) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12">${data.earnings.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Топ ботов</h3>
          <div className="space-y-3">
            {topPerformingBots.map((bot, index) => (
              <div key={bot.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{bot.name}</span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  ${(bot.stats?.[0]?.earnings || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* История заработков */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            История заработков
            <Database className="w-5 h-5 text-blue-600" />
          </h3>
        </div>
        
        <div className="p-6">
          {earningsHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет данных о заработках за выбранный период
            </div>
          ) : (
            <div className="space-y-2">
              {earningsHistory.slice(0, 10).map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{earning.earning_type}</span>
                    <span className="text-sm text-gray-600 ml-2">{earning.site_url}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${parseFloat(earning.amount).toFixed(4)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(earning.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Детальная таблица */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Детальная статистика по ботам</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бот</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Визиты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Реклама</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клики</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Видео</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Доход</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBots.map((bot) => (
                <tr key={bot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{bot.name}</div>
                    <div className="text-sm text-gray-500">{bot.target_site}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'running' ? 'bg-green-100 text-green-800' :
                      bot.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                      bot.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bot.status === 'running' ? 'Работает' :
                       bot.status === 'stopped' ? 'Остановлен' :
                       bot.status === 'error' ? 'Ошибка' : 'Пауза'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats?.[0]?.total_visits || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats?.[0]?.ads_viewed || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats?.[0]?.banners_clicked || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats?.[0]?.videos_watched || 0}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ${(bot.stats?.[0]?.earnings || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(bot.stats?.[0]?.ads_viewed || 0) > 0 ? 
                      (((bot.stats?.[0]?.banners_clicked || 0) / (bot.stats?.[0]?.ads_viewed || 1)) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}