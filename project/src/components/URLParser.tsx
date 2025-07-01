import React, { useState } from 'react';
import { Globe, Plus, Search, Download, Upload, Trash2, ExternalLink } from 'lucide-react';
import { WebResource } from '../types/database';
import { databaseService } from '../services/database';

export default function URLParser() {
  const [urls, setUrls] = useState<WebResource[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      const data = await databaseService.getWebResources();
      setUrls(data);
    } catch (error) {
      console.error('Ошибка загрузки URL:', error);
    }
  };

  const parseUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Простой парсинг заголовка
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
      
      // Парсинг описания
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      const description = descMatch ? descMatch[1] : '';

      return { title, description };
    } catch (error) {
      return { 
        title: new URL(url).hostname, 
        description: 'Не удалось получить информацию' 
      };
    }
  };

  const addUrl = async () => {
    if (!newUrl.trim()) return;

    setLoading(true);
    try {
      const { title, description } = await parseUrl(newUrl);
      
      const resource = await databaseService.createWebResource({
        url: newUrl,
        title,
        description,
        category: category || 'Без категории',
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'active',
        metadata: {}
      });

      setUrls([resource, ...urls]);
      setNewUrl('');
      setCategory('');
      setTags('');
    } catch (error) {
      alert('Ошибка добавления URL');
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    if (!confirm('Удалить этот URL?')) return;
    
    // В реальном приложении здесь будет вызов API
    setUrls(urls.filter(url => url.id !== id));
  };

  const exportUrls = () => {
    const data = JSON.stringify(urls, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urls-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importUrls = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        
        if (file.name.endsWith('.json')) {
          const importedUrls = JSON.parse(text);
          setUrls([...urls, ...importedUrls]);
        } else {
          // Импорт из текстового файла (по одному URL на строку)
          const urlList = text.split('\n').filter(url => url.trim());
          for (const url of urlList) {
            if (url.trim()) {
              await addUrlFromString(url.trim());
            }
          }
        }
      } catch (error) {
        alert('Ошибка импорта файла');
      }
    };
    input.click();
  };

  const addUrlFromString = async (url: string) => {
    try {
      const { title, description } = await parseUrl(url);
      const resource = await databaseService.createWebResource({
        url,
        title,
        description,
        category: 'Импортированные',
        tags: [],
        status: 'active',
        metadata: {}
      });
      setUrls(prev => [resource, ...prev]);
    } catch (error) {
      console.error('Ошибка добавления URL:', error);
    }
  };

  const filteredUrls = urls.filter(url =>
    url.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(urls.map(url => url.category))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Парсер URL</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={importUrls}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-4 h-4" />
            Импорт
          </button>
          <button
            onClick={exportUrls}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Форма добавления */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Добавить новый URL</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Категория"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Теги (через запятую)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={addUrl}
          disabled={!newUrl.trim() || loading}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? 'Парсинг...' : 'Добавить URL'}
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="text-sm text-gray-600">
          Всего: {filteredUrls.length} из {urls.length}
        </div>
      </div>

      {/* Список URL */}
      <div className="space-y-4">
        {filteredUrls.map((url) => (
          <div key={url.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{url.title}</h3>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {url.category}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    url.status === 'active' ? 'bg-green-500' : 
                    url.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
                
                <a
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  {url.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                {url.description && (
                  <p className="text-gray-600 text-sm mt-1">{url.description}</p>
                )}
                
                {url.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {url.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Добавлен: {new Date(url.createdAt).toLocaleString()}
                  {url.lastChecked && (
                    <span className="ml-4">
                      Проверен: {new Date(url.lastChecked).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => deleteUrl(url.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUrls.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery ? 'URL не найдены' : 'Нет сохраненных URL'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первый URL для начала работы'}
          </p>
        </div>
      )}
    </div>
  );
}