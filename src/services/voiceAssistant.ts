export class VoiceAssistant {
  private static synthesis: SpeechSynthesis | null = null;
  private static recognition: any = null;
  private static isListening = false;
  private static voice: SpeechSynthesisVoice | null = null;

  static initialize() {
    // Инициализация синтеза речи
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }

    // Инициализация распознавания речи
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ru-RU';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        this.processVoiceCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Ошибка распознавания речи:', event.error);
      };
    }
  }

  private static loadVoices() {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    // Ищем женский русский голос
    this.voice = voices.find(voice => 
      voice.lang.includes('ru') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.includes('ru')) || voices[0];

    // Если голоса еще не загружены, ждем
    if (voices.length === 0) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  static speak(text: string) {
    if (!this.synthesis || !this.voice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // Более высокий тон для женского голоса
    utterance.volume = 0.8;

    this.synthesis.speak(utterance);
  }

  static start() {
    if (!this.recognition) {
      this.speak('Распознавание речи не поддерживается в вашем браузере');
      return;
    }

    if (this.isListening) return;

    this.recognition.start();
    this.isListening = true;
    this.speak('Голосовой помощник активирован. Слушаю команды.');
  }

  static stop() {
    if (!this.recognition || !this.isListening) return;

    this.recognition.stop();
    this.isListening = false;
    this.speak('Голосовой помощник отключен');
  }

  private static processVoiceCommand(command: string) {
    console.log('Голосовая команда:', command);

    // Команды для управления ботами
    if (command.includes('создать бот') || command.includes('новый бот')) {
      this.speak('Создаю нового бота');
      // Здесь можно вызвать функцию создания бота
      return;
    }

    if (command.includes('запустить все боты') || command.includes('старт все')) {
      this.speak('Запускаю всех ботов');
      // Здесь можно вызвать функцию запуска всех ботов
      return;
    }

    if (command.includes('остановить все боты') || command.includes('стоп все')) {
      this.speak('Останавливаю всех ботов');
      // Здесь можно вызвать функцию остановки всех ботов
      return;
    }

    if (command.includes('статистика') || command.includes('отчет')) {
      this.speak('Показываю статистику');
      // Здесь можно переключиться на вкладку статистики
      return;
    }

    if (command.includes('терминал') || command.includes('логи')) {
      this.speak('Открываю терминал');
      // Здесь можно переключиться на вкладку терминала
      return;
    }

    if (command.includes('настройки')) {
      this.speak('Открываю настройки');
      // Здесь можно переключиться на вкладку настроек
      return;
    }

    if (command.includes('сколько заработали') || command.includes('доход')) {
      // Здесь можно получить актуальную статистику
      const earnings = this.getTotalEarnings();
      this.speak(`Общий доход составляет ${earnings.toFixed(2)} долларов`);
      return;
    }

    if (command.includes('сколько ботов работает') || command.includes('активные боты')) {
      const activeBots = this.getActiveBots();
      this.speak(`Сейчас работает ${activeBots} ботов`);
      return;
    }

    // Если команда не распознана
    this.speak('Команда не распознана. Попробуйте сказать: создать бота, запустить всех ботов, статистика, или остановить всех ботов');
  }

  private static getTotalEarnings(): number {
    const bots = JSON.parse(localStorage.getItem('monetization-bots') || '[]');
    return bots.reduce((total: number, bot: any) => total + bot.stats.earnings, 0);
  }

  private static getActiveBots(): number {
    const bots = JSON.parse(localStorage.getItem('monetization-bots') || '[]');
    return bots.filter((bot: any) => bot.status === 'running').length;
  }

  static isActive(): boolean {
    return this.isListening;
  }
}