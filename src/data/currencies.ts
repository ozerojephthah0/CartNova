export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CNY'
  | 'INR'
  | 'AED'
  | 'SAR'
  | 'ZAR'
  | 'KES'
  | 'GHS'
  | 'EGP'
  | 'CHF'
  | 'SGD'
  | 'BRL'
  | 'MXN'
  | 'TRY'
  | 'KRW'
  | 'NZD'
  | 'SEK'
  | 'NOK'
  | 'PLN'
  | 'PHP'
  | 'IDR'
  | 'THB'
  | 'MYR'
  | 'VND';

export type CurrencyRegion = 'All' | 'Popular' | 'Africa' | 'Americas' | 'Europe' | 'Asia & Pacific' | 'Middle East';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  name: string;
  country: string;
  flag: string;
  region: 'Africa' | 'Americas' | 'Europe' | 'Asia & Pacific' | 'Middle East';
  isPopular?: boolean;
  decimals?: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    rate: 1,
    name: 'Nigerian Naira',
    country: 'Nigeria',
    flag: '🇳🇬',
    region: 'Africa',
    isPopular: true,
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 1 / 1500,
    name: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸',
    region: 'Americas',
    isPopular: true,
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.92 / 1500,
    name: 'Euro',
    country: 'European Union',
    flag: '🇪🇺',
    region: 'Europe',
    isPopular: true,
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.79 / 1500,
    name: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    isPopular: true,
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    rate: 1.38 / 1500,
    name: 'Canadian Dollar',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Americas',
    isPopular: true,
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    rate: 1.53 / 1500,
    name: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    rate: 155.0 / 1500,
    name: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    rate: 7.25 / 1500,
    name: 'Chinese Yuan',
    country: 'China',
    flag: '🇨🇳',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    rate: 83.8 / 1500,
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    rate: 3.67 / 1500,
    name: 'UAE Dirham',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    isPopular: true,
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    rate: 3.75 / 1500,
    name: 'Saudi Riyal',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    isPopular: false,
    decimals: 2,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R ',
    rate: 18.2 / 1500,
    name: 'South African Rand',
    country: 'South Africa',
    flag: '🇿🇦',
    region: 'Africa',
    isPopular: true,
    decimals: 2,
  },
  KES: {
    code: 'KES',
    symbol: 'KSh ',
    rate: 130.0 / 1500,
    name: 'Kenyan Shilling',
    country: 'Kenya',
    flag: '🇰🇪',
    region: 'Africa',
    isPopular: true,
    decimals: 0,
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    rate: 15.6 / 1500,
    name: 'Ghanaian Cedi',
    country: 'Ghana',
    flag: '🇬🇭',
    region: 'Africa',
    isPopular: true,
    decimals: 2,
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£',
    rate: 48.5 / 1500,
    name: 'Egyptian Pound',
    country: 'Egypt',
    flag: '🇪🇬',
    region: 'Africa',
    isPopular: false,
    decimals: 2,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF ',
    rate: 0.89 / 1500,
    name: 'Swiss Franc',
    country: 'Switzerland',
    flag: '🇨🇭',
    region: 'Europe',
    isPopular: true,
    decimals: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    rate: 1.35 / 1500,
    name: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 2,
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    rate: 5.48 / 1500,
    name: 'Brazilian Real',
    country: 'Brazil',
    flag: '🇧🇷',
    region: 'Americas',
    isPopular: false,
    decimals: 2,
  },
  MXN: {
    code: 'MXN',
    symbol: 'Mex$',
    rate: 18.3 / 1500,
    name: 'Mexican Peso',
    country: 'Mexico',
    flag: '🇲🇽',
    region: 'Americas',
    isPopular: false,
    decimals: 2,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    rate: 33.8 / 1500,
    name: 'Turkish Lira',
    country: 'Turkey',
    flag: '🇹🇷',
    region: 'Europe',
    isPopular: false,
    decimals: 2,
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    rate: 1380.0 / 1500,
    name: 'South Korean Won',
    country: 'South Korea',
    flag: '🇰🇷',
    region: 'Asia & Pacific',
    isPopular: true,
    decimals: 0,
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    rate: 1.66 / 1500,
    name: 'New Zealand Dollar',
    country: 'New Zealand',
    flag: '🇳🇿',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 2,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr ',
    rate: 10.6 / 1500,
    name: 'Swedish Krona',
    country: 'Sweden',
    flag: '🇸🇪',
    region: 'Europe',
    isPopular: false,
    decimals: 2,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr ',
    rate: 10.8 / 1500,
    name: 'Norwegian Krone',
    country: 'Norway',
    flag: '🇳🇴',
    region: 'Europe',
    isPopular: false,
    decimals: 2,
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł ',
    rate: 3.96 / 1500,
    name: 'Polish Zloty',
    country: 'Poland',
    flag: '🇵🇱',
    region: 'Europe',
    isPopular: false,
    decimals: 2,
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    rate: 58.5 / 1500,
    name: 'Philippine Peso',
    country: 'Philippines',
    flag: '🇵🇭',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 2,
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp ',
    rate: 16100.0 / 1500,
    name: 'Indonesian Rupiah',
    country: 'Indonesia',
    flag: '🇮🇩',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 0,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    rate: 36.6 / 1500,
    name: 'Thai Baht',
    country: 'Thailand',
    flag: '🇹🇭',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM ',
    rate: 4.72 / 1500,
    name: 'Malaysian Ringgit',
    country: 'Malaysia',
    flag: '🇲🇾',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 2,
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    rate: 25400.0 / 1500,
    name: 'Vietnamese Dong',
    country: 'Vietnam',
    flag: '🇻🇳',
    region: 'Asia & Pacific',
    isPopular: false,
    decimals: 0,
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);
