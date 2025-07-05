import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Eye, MousePointer, Play, Calendar } from 'lucide-react';

interface BotStatisticsProps {
  bots: any[];
}

export default function BotStatistics({ bots }: BotStatisticsProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedBot, setSelectedBot] = useState<string>('all');

  const filteredBots = selectedBot === 'all' ? bots : bots.filter(bot => bot.id === selectedBot);

  const totalStats = filteredBots.reduce((acc, bot) => ({
    totalVisits: acc.totalVisits + bot.stats.totalVisits,
    adsViewed: acc.adsViewed + bot.stats.adsViewed,
    bannersClicked: acc.bannersClicked + bot.stats.bannersClicked,
    videosWatched: acc.videosWatched + bot.stats.videosWatched,
    earnings: acc.earnings + bot.stats.earnings
  }), { totalVisits: 0, adsViewed: 0, bannersClicked: 0, videosWatched: 0, earnings: 0 });

  const averageStats = {
    clickRate: filteredBots.length > 0 ? (totalStats.bannersClicked / totalStats.adsViewed * 100) || 0 : 0,
    earningsPerVisit: filteredBots.length > 0 ? (totalStats.earnings / totalStats.totalVisits) || 0 : 0,
    adsPerVisit: filteredBots.length > 0 ? (totalStats.adsViewed / totalStats.totalVisits) || 0 : 0
  };

  const topPerformingBots = [...bots]
    .sort((a, b) => b.stats.earnings - a.stats.earnings)
    .slice(0, 5);

  const generateChartData = () => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => ({
      day,
      visits: Math.floor(Math.random() * 100) + 20,
      earnings: Math.random() * 10 + 2
    }));
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
              <p className="text-sm text-green-500">+12.5% за неделю</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего визитов</p>
              <p className="text-3xl font-bold text-blue-600">{totalStats.totalVisits}</p>
              <p className="text-sm text-blue-500">+8.3% за неделю</p>
            </div>
            <Eye className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просмотров рекламы</p>
              <p className="text-3xl font-bold text-purple-600">{totalStats.adsViewed}</p>
              <p className="text-sm text-purple-500">+15.7% за неделю</p>
            </div>
            <Play className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Кликов по баннерам</p>
              <p className="text-3xl font-bold text-orange-600">{totalStats.bannersClicked}</p>
              <p className="text-sm text-orange-500">+22.1% за неделю</p>
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
                  ${bot.stats.earnings.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
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
                    <div className="text-sm text-gray-500">{bot.targetSite}</div>
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
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats.totalVisits}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats.adsViewed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats.bannersClicked}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{bot.stats.videosWatched}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ${bot.stats.earnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {bot.stats.adsViewed > 0 ? ((bot.stats.bannersClicked / bot.stats.adsViewed) * 100).toFixed(1) : 0}%
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