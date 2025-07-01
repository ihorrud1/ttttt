import { WebResource, BrowserFingerprint, Cookie, Account, PaymentCard, Address, PhoneNumber, Token, Wallet, Profile, DatabaseStats } from '../types/database';

class DatabaseService {
  private db: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // В реальном приложении здесь будет SQLite
    // Пока используем localStorage для демонстрации
    this.db = {
      profiles: this.getFromStorage('profiles', []),
      webResources: this.getFromStorage('webResources', []),
      fingerprints: this.getFromStorage('fingerprints', []),
      cookies: this.getFromStorage('cookies', []),
      accounts: this.getFromStorage('accounts', []),
      cards: this.getFromStorage('cards', []),
      addresses: this.getFromStorage('addresses', []),
      phones: this.getFromStorage('phones', []),
      tokens: this.getFromStorage('tokens', []),
      wallets: this.getFromStorage('wallets', [])
    };

    this.isInitialized = true;
  }

  private getFromStorage(key: string, defaultValue: any) {
    try {
      const data = localStorage.getItem(`db_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage(key: string, data: any) {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  }

  // Профили
  async getProfiles(): Promise<Profile[]> {
    await this.initialize();
    return this.db.profiles;
  }

  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    await this.initialize();
    const newProfile: Profile = {
      ...profile,
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.profiles.push(newProfile);
    this.saveToStorage('profiles', this.db.profiles);
    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    await this.initialize();
    const index = this.db.profiles.findIndex((p: Profile) => p.id === id);
    if (index === -1) return null;
    
    this.db.profiles[index] = { ...this.db.profiles[index], ...updates, updatedAt: new Date() };
    this.saveToStorage('profiles', this.db.profiles);
    return this.db.profiles[index];
  }

  async deleteProfile(id: string): Promise<boolean> {
    await this.initialize();
    const index = this.db.profiles.findIndex((p: Profile) => p.id === id);
    if (index === -1) return false;
    
    this.db.profiles.splice(index, 1);
    this.saveToStorage('profiles', this.db.profiles);
    return true;
  }

  // Веб-ресурсы
  async getWebResources(): Promise<WebResource[]> {
    await this.initialize();
    return this.db.webResources;
  }

  async createWebResource(resource: Omit<WebResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebResource> {
    await this.initialize();
    const newResource: WebResource = {
      ...resource,
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.db.webResources.push(newResource);
    this.saveToStorage('webResources', this.db.webResources);
    return newResource;
  }

  // Отпечатки браузера
  async getFingerprints(): Promise<BrowserFingerprint[]> {
    await this.initialize();
    return this.db.fingerprints;
  }

  async createFingerprint(fingerprint: Omit<BrowserFingerprint, 'id' | 'createdAt'>): Promise<BrowserFingerprint> {
    await this.initialize();
    const newFingerprint: BrowserFingerprint = {
      ...fingerprint,
      id: `fingerprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.fingerprints.push(newFingerprint);
    this.saveToStorage('fingerprints', this.db.fingerprints);
    return newFingerprint;
  }

  // Куки
  async getCookies(): Promise<Cookie[]> {
    await this.initialize();
    return this.db.cookies;
  }

  async createCookie(cookie: Omit<Cookie, 'id' | 'createdAt'>): Promise<Cookie> {
    await this.initialize();
    const newCookie: Cookie = {
      ...cookie,
      id: `cookie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.cookies.push(newCookie);
    this.saveToStorage('cookies', this.db.cookies);
    return newCookie;
  }

  // Аккаунты
  async getAccounts(): Promise<Account[]> {
    await this.initialize();
    return this.db.accounts;
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    await this.initialize();
    const newAccount: Account = {
      ...account,
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.accounts.push(newAccount);
    this.saveToStorage('accounts', this.db.accounts);
    return newAccount;
  }

  // Карты
  async getCards(): Promise<PaymentCard[]> {
    await this.initialize();
    return this.db.cards;
  }

  async createCard(card: Omit<PaymentCard, 'id' | 'createdAt'>): Promise<PaymentCard> {
    await this.initialize();
    const newCard: PaymentCard = {
      ...card,
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.cards.push(newCard);
    this.saveToStorage('cards', this.db.cards);
    return newCard;
  }

  // Адреса
  async getAddresses(): Promise<Address[]> {
    await this.initialize();
    return this.db.addresses;
  }

  async createAddress(address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
    await this.initialize();
    const newAddress: Address = {
      ...address,
      id: `address_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.addresses.push(newAddress);
    this.saveToStorage('addresses', this.db.addresses);
    return newAddress;
  }

  // Телефоны
  async getPhones(): Promise<PhoneNumber[]> {
    await this.initialize();
    return this.db.phones;
  }

  async createPhone(phone: Omit<PhoneNumber, 'id' | 'createdAt'>): Promise<PhoneNumber> {
    await this.initialize();
    const newPhone: PhoneNumber = {
      ...phone,
      id: `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.phones.push(newPhone);
    this.saveToStorage('phones', this.db.phones);
    return newPhone;
  }

  // Токены
  async getTokens(): Promise<Token[]> {
    await this.initialize();
    return this.db.tokens;
  }

  async createToken(token: Omit<Token, 'id' | 'createdAt'>): Promise<Token> {
    await this.initialize();
    const newToken: Token = {
      ...token,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.tokens.push(newToken);
    this.saveToStorage('tokens', this.db.tokens);
    return newToken;
  }

  // Кошельки
  async getWallets(): Promise<Wallet[]> {
    await this.initialize();
    return this.db.wallets;
  }

  async createWallet(wallet: Omit<Wallet, 'id' | 'createdAt'>): Promise<Wallet> {
    await this.initialize();
    const newWallet: Wallet = {
      ...wallet,
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.db.wallets.push(newWallet);
    this.saveToStorage('wallets', this.db.wallets);
    return newWallet;
  }

  // Статистика
  async getStats(): Promise<DatabaseStats> {
    await this.initialize();
    return {
      profiles: this.db.profiles.length,
      accounts: this.db.accounts.length,
      webResources: this.db.webResources.length,
      fingerprints: this.db.fingerprints.length,
      cookies: this.db.cookies.length,
      cards: this.db.cards.length,
      addresses: this.db.addresses.length,
      phones: this.db.phones.length,
      tokens: this.db.tokens.length,
      wallets: this.db.wallets.length
    };
  }

  // Поиск
  async search(query: string, type?: string): Promise<any[]> {
    await this.initialize();
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    if (!type || type === 'profiles') {
      const profiles = this.db.profiles.filter((p: Profile) => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
      results.push(...profiles.map((p: Profile) => ({ ...p, type: 'profile' })));
    }

    if (!type || type === 'accounts') {
      const accounts = this.db.accounts.filter((a: Account) => 
        a.email.toLowerCase().includes(lowerQuery) ||
        a.login?.toLowerCase().includes(lowerQuery) ||
        a.platform.toLowerCase().includes(lowerQuery)
      );
      results.push(...accounts.map((a: Account) => ({ ...a, type: 'account' })));
    }

    if (!type || type === 'webResources') {
      const resources = this.db.webResources.filter((r: WebResource) => 
        r.url.toLowerCase().includes(lowerQuery) ||
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery)
      );
      results.push(...resources.map((r: WebResource) => ({ ...r, type: 'webResource' })));
    }

    return results;
  }

  // Экспорт данных
  async exportData(): Promise<string> {
    await this.initialize();
    return JSON.stringify(this.db, null, 2);
  }

  // Импорт данных
  async importData(data: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(data);
      this.db = { ...this.db, ...importedData };
      
      // Сохраняем все таблицы
      Object.keys(this.db).forEach(key => {
        this.saveToStorage(key, this.db[key]);
      });
      
      return true;
    } catch {
      return false;
    }
  }
}

export const databaseService = new DatabaseService();