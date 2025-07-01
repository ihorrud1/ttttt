export interface WebResource {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'blocked';
  lastChecked?: Date;
  responseTime?: number;
  metadata: Record<string, any>;
}

export interface BrowserFingerprint {
  id: string;
  name: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  plugins: string[];
  webrtc: {
    enabled: boolean;
    localIP?: string;
    publicIP?: string;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface Cookie {
  id: string;
  domain: string;
  name: string;
  value: string;
  path: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  profileId?: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  email: string;
  password: string;
  login?: string;
  platform: string;
  status: 'active' | 'banned' | 'suspended' | 'pending';
  createdAt: Date;
  lastLogin?: Date;
  notes?: string;
  profileId?: string;
  twoFactorSecret?: string;
  recoveryEmail?: string;
  phoneNumber?: string;
}

export interface PaymentCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  bankName?: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';
  isActive: boolean;
  balance?: number;
  currency: string;
  createdAt: Date;
  profileId?: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'personal';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  profileId?: string;
  createdAt: Date;
}

export interface PhoneNumber {
  id: string;
  number: string;
  country: string;
  carrier?: string;
  type: 'mobile' | 'landline' | 'voip';
  isVerified: boolean;
  isActive: boolean;
  profileId?: string;
  createdAt: Date;
  notes?: string;
}

export interface Token {
  id: string;
  name: string;
  value: string;
  type: 'api' | 'auth' | 'session' | 'refresh' | 'access';
  platform: string;
  expiresAt?: Date;
  isActive: boolean;
  profileId?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface Wallet {
  id: string;
  address: string;
  privateKey?: string;
  publicKey?: string;
  mnemonic?: string;
  type: 'bitcoin' | 'ethereum' | 'litecoin' | 'other';
  network: string;
  balance?: number;
  isActive: boolean;
  profileId?: string;
  createdAt: Date;
  notes?: string;
}

export interface Profile {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  fingerprintId?: string;
  accounts: Account[];
  cookies: Cookie[];
  cards: PaymentCard[];
  addresses: Address[];
  phones: PhoneNumber[];
  tokens: Token[];
  wallets: Wallet[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  tags: string[];
}

export interface DatabaseStats {
  profiles: number;
  accounts: number;
  webResources: number;
  fingerprints: number;
  cookies: number;
  cards: number;
  addresses: number;
  phones: number;
  tokens: number;
  wallets: number;
}