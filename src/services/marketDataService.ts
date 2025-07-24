// Enhanced Market Data Service with Technical Indicators and Real-time Updates

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  high52w?: number;
  low52w?: number;
  sector: string;
  type: 'INDEX' | 'STOCK' | 'OPTION';
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  ema20: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OptionChainData {
  strikePrice: number;
  callLTP: number;
  callOI: number;
  callVolume: number;
  callChange: number;
  putLTP: number;
  putOI: number;
  putVolume: number;
  putChange: number;
}

class MarketDataService {
  private subscribers: Map<string, ((data: MarketData[]) => void)[]> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  // Sector-wise stock data
  private readonly sectorData = {
    'Nifty50': [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
      'SBIN', 'BHARTIARTL', 'ITC', 'ASIANPAINT', 'LT', 'AXISBANK', 'MARUTI', 'SUNPHARMA'
    ],
    'BankNifty': [
      'HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'SBIN', 'AXISBANK', 'INDUSINDBK',
      'BANKBARODA', 'PNB', 'IDFCFIRSTB', 'FEDERALBNK'
    ],
    'Auto': [
      'MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'HEROMOTOCO', 'TVSMOTORS',
      'EICHERMOT', 'ASHOKLEY', 'TVSMOTOR', 'BAJAJFINSV'
    ],
    'Pharma': [
      'SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'BIOCON', 'LUPIN',
      'CADILAHC', 'AUROPHARMA', 'TORNTPHARM', 'GLENMARK'
    ],
    'FMCG': [
      'HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'GODREJCP',
      'MARICO', 'COLPAL', 'EMAMILTD', 'TATACONSUM'
    ],
    'IT': [
      'TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTTS',
      'MINDTREE', 'MPHASIS', 'COFORGE', 'LTIM'
    ]
  };

  // Mock fundamental data
  private readonly fundamentalData: Record<string, any> = {
    'RELIANCE': { marketCap: 1500000, pe: 24.5, eps: 95.2, high52w: 2856, low52w: 1830 },
    'TCS': { marketCap: 1200000, pe: 28.3, eps: 142.8, high52w: 4043, low52w: 2880 },
    'HDFCBANK': { marketCap: 800000, pe: 18.7, eps: 78.4, high52w: 1725, low52w: 1363 },
    'INFY': { marketCap: 650000, pe: 26.1, eps: 58.9, high52w: 1953, low52w: 1311 },
    'ICICIBANK': { marketCap: 550000, pe: 15.2, eps: 45.6, high52w: 1257, low52w: 785 }
  };

  constructor() {
    this.initializeMarketData();
    this.startRealTimeUpdates();
  }

  private initializeMarketData() {
    // Initialize indices
    const indices = [
      { symbol: 'NIFTY', name: 'Nifty 50', basePrice: 19456.75, sector: 'INDEX' },
      { symbol: 'BANKNIFTY', name: 'Bank Nifty', basePrice: 43567.80, sector: 'INDEX' },
      { symbol: 'FINNIFTY', name: 'Fin Nifty', basePrice: 19234.65, sector: 'INDEX' }
    ];

    // Initialize all sector stocks
    Object.entries(this.sectorData).forEach(([sector, stocks]) => {
      stocks.forEach(symbol => {
        const basePrice = this.getRandomPrice(symbol);
        const fundamental = this.fundamentalData[symbol] || this.generateRandomFundamental();
        
        this.marketData.set(symbol, {
          symbol,
          name: this.getStockName(symbol),
          price: basePrice,
          change: 0,
          changePercent: 0,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          sector,
          type: 'STOCK',
          ...fundamental
        });
      });
    });

    // Initialize indices
    indices.forEach(index => {
      this.marketData.set(index.symbol, {
        symbol: index.symbol,
        name: index.name,
        price: index.basePrice,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        sector: index.sector,
        type: 'INDEX'
      });
    });
  }

  private getRandomPrice(symbol: string): number {
    const priceRanges: Record<string, [number, number]> = {
      'RELIANCE': [2200, 2800],
      'TCS': [3200, 4000],
      'HDFCBANK': [1400, 1700],
      'INFY': [1400, 1900],
      'ICICIBANK': [800, 1200]
    };

    const [min, max] = priceRanges[symbol] || [100, 5000];
    return Math.random() * (max - min) + min;
  }

  private getStockName(symbol: string): string {
    const names: Record<string, string> = {
      'RELIANCE': 'Reliance Industries',
      'TCS': 'Tata Consultancy Services',
      'HDFCBANK': 'HDFC Bank',
      'INFY': 'Infosys',
      'ICICIBANK': 'ICICI Bank',
      'KOTAKBANK': 'Kotak Mahindra Bank',
      'SBIN': 'State Bank of India',
      'BHARTIARTL': 'Bharti Airtel',
      'ITC': 'ITC Limited',
      'MARUTI': 'Maruti Suzuki'
    };
    return names[symbol] || symbol;
  }

  private generateRandomFundamental() {
    return {
      marketCap: Math.floor(Math.random() * 500000) + 50000,
      pe: Math.random() * 40 + 10,
      eps: Math.random() * 100 + 10,
      high52w: Math.random() * 1000 + 500,
      low52w: Math.random() * 500 + 100
    };
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updatePrices();
      this.notifySubscribers();
    }, 2000); // Update every 2 seconds
  }

  private updatePrices() {
    this.marketData.forEach((data, symbol) => {
      const volatility = data.type === 'INDEX' ? 0.002 : 0.005;
      const changePercent = (Math.random() - 0.5) * volatility * 100;
      const newPrice = data.price * (1 + changePercent / 100);
      const change = newPrice - data.price;

      this.marketData.set(symbol, {
        ...data,
        price: Number(newPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: data.volume + Math.floor(Math.random() * 10000)
      });
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach((callbacks, sector) => {
      const sectorData = this.getMarketDataBySector(sector);
      callbacks.forEach(callback => callback(sectorData));
    });
  }

  // Public methods
  subscribe(sector: string, callback: (data: MarketData[]) => void): () => void {
    if (!this.subscribers.has(sector)) {
      this.subscribers.set(sector, []);
    }
    this.subscribers.get(sector)!.push(callback);

    // Send initial data
    callback(this.getMarketDataBySector(sector));

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(sector);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  getMarketDataBySector(sector: string): MarketData[] {
    if (sector === 'ALL') {
      return Array.from(this.marketData.values());
    }
    
    if (sector === 'INDEX') {
      return Array.from(this.marketData.values()).filter(data => data.type === 'INDEX');
    }

    const symbols = this.sectorData[sector as keyof typeof this.sectorData] || [];
    return symbols.map(symbol => this.marketData.get(symbol)!).filter(Boolean);
  }

  getStockData(symbol: string): MarketData | undefined {
    return this.marketData.get(symbol);
  }

  // Technical Indicators
  calculateTechnicalIndicators(symbol: string): TechnicalIndicators {
    const data = this.marketData.get(symbol);
    if (!data) throw new Error('Symbol not found');

    // Mock technical indicators (in real app, calculate from historical data)
    return {
      rsi: Math.random() * 100,
      macd: {
        macd: (Math.random() - 0.5) * 10,
        signal: (Math.random() - 0.5) * 8,
        histogram: (Math.random() - 0.5) * 5
      },
      sma20: data.price * (0.95 + Math.random() * 0.1),
      sma50: data.price * (0.9 + Math.random() * 0.2),
      ema20: data.price * (0.96 + Math.random() * 0.08),
      bollinger: {
        upper: data.price * 1.05,
        middle: data.price,
        lower: data.price * 0.95
      }
    };
  }

  // Candlestick data
  getCandlestickData(symbol: string, timeframe: string = '1D'): CandleData[] {
    const data = this.marketData.get(symbol);
    if (!data) return [];

    // Generate mock candlestick data
    const candles: CandleData[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const basePrice = data.price * (0.95 + Math.random() * 0.1);
      const high = basePrice * (1 + Math.random() * 0.03);
      const low = basePrice * (1 - Math.random() * 0.03);
      const open = low + Math.random() * (high - low);
      const close = low + Math.random() * (high - low);

      candles.push({
        time: time.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }

    return candles;
  }

  // Option Chain
  getOptionChain(symbol: string): OptionChainData[] {
    const data = this.marketData.get(symbol);
    if (!data) return [];

    const strikes: OptionChainData[] = [];
    const basePrice = data.price;
    const atmStrike = Math.round(basePrice / 50) * 50;

    for (let i = -10; i <= 10; i++) {
      const strike = atmStrike + (i * 50);
      const isITM = strike < basePrice;
      
      strikes.push({
        strikePrice: strike,
        callLTP: isITM ? basePrice - strike + Math.random() * 50 : Math.random() * 20,
        callOI: Math.floor(Math.random() * 100000) + 10000,
        callVolume: Math.floor(Math.random() * 50000) + 1000,
        callChange: (Math.random() - 0.5) * 10,
        putLTP: !isITM ? strike - basePrice + Math.random() * 50 : Math.random() * 20,
        putOI: Math.floor(Math.random() * 100000) + 10000,
        putVolume: Math.floor(Math.random() * 50000) + 1000,
        putChange: (Math.random() - 0.5) * 10
      });
    }

    return strikes;
  }

  // Market status
  isMarketOpen(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    // Market hours: 9:15 AM to 3:30 PM (IST)
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    
    return currentTime >= marketOpen && currentTime <= marketClose;
  }

  // Search functionality
  searchSymbols(query: string): MarketData[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.marketData.values()).filter(data =>
      data.symbol.toLowerCase().includes(searchTerm) ||
      data.name.toLowerCase().includes(searchTerm)
    );
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.subscribers.clear();
  }
}

export const marketDataService = new MarketDataService();