export interface MarketDataPoint {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  peRatio?: number
  eps?: number
  week52High?: number
  week52Low?: number
  sector: string
  lastUpdated: string
  rsi?: number
  macd?: number
  sma20?: number
  sma50?: number
}

export interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: number
  signal: number
  sma20: number
  sma50: number
  recommendation: 'BUY' | 'SELL' | 'HOLD'
}

export interface OptionChainData {
  strikePrice: number
  callLTP: number
  callOI: number
  callVolume: number
  callChange: number
  putLTP: number
  putOI: number
  putVolume: number
  putChange: number
}

export const SECTORS = {
  'Nifty50': ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK'],
  'BankNifty': ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK', 'BANDHANBNK', 'FEDERALBNK', 'IDFCFIRSTB', 'PNB'],
  'Auto': ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'HEROMOTOCO', 'TVSMOTOR', 'EICHERMOT', 'ASHOKLEY', 'BALKRISIND', 'MRF'],
  'Pharma': ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'BIOCON', 'CADILAHC', 'AUROPHARMA', 'LUPIN', 'TORNTPHARM', 'GLENMARK'],
  'FMCG': ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'MARICO', 'GODREJCP', 'COLPAL', 'EMAMILTD', 'VBL'],
  'IT': ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTI', 'MINDTREE', 'MPHASIS', 'OFSS', 'COFORGE']
}

class MarketDataService {
  private mockData: Map<string, MarketDataPoint> = new Map()
  private candleData: Map<string, CandleData[]> = new Map()
  private subscribers: Set<(data: MarketDataPoint[]) => void> = new Set()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeMockData()
    this.startRealTimeUpdates()
  }

  private initializeMockData() {
    // Initialize with sample data - in real app this would come from Angel One API
    const sampleStocks = [
      // Nifty50
      { symbol: 'RELIANCE', price: 2456.75, change: 23.45, changePercent: 0.96, volume: 1234567, sector: 'Energy', marketCap: 1658000000000, peRatio: 28.5, eps: 86.2, week52High: 2856.15, week52Low: 2100.50 },
      { symbol: 'TCS', price: 3245.80, change: -12.30, changePercent: -0.38, volume: 987654, sector: 'IT', marketCap: 1180000000000, peRatio: 26.8, eps: 121.0, week52High: 4043.75, week52Low: 2890.25 },
      { symbol: 'HDFCBANK', price: 1678.90, change: 8.75, changePercent: 0.52, volume: 2345678, sector: 'Banking', marketCap: 1275000000000, peRatio: 18.2, eps: 92.3, week52High: 1725.00, week52Low: 1363.55 },
      { symbol: 'INFY', price: 1456.25, change: 15.60, changePercent: 1.08, volume: 1876543, sector: 'IT', marketCap: 615000000000, peRatio: 24.1, eps: 60.4, week52High: 1953.90, week52Low: 1311.20 },
      { symbol: 'ICICIBANK', price: 987.45, change: -5.25, changePercent: -0.53, volume: 3456789, sector: 'Banking', marketCap: 690000000000, peRatio: 15.6, eps: 63.2, week52High: 1257.35, week52Low: 785.60 },
      
      // BankNifty
      { symbol: 'SBIN', price: 567.80, change: 12.45, changePercent: 2.24, volume: 4567890, sector: 'Banking', marketCap: 506000000000, peRatio: 12.8, eps: 44.3, week52High: 825.00, week52Low: 462.10 },
      { symbol: 'AXISBANK', price: 1123.45, change: -8.90, changePercent: -0.78, volume: 2345671, sector: 'Banking', marketCap: 345000000000, peRatio: 14.2, eps: 79.1, week52High: 1339.20, week52Low: 675.75 },
      { symbol: 'KOTAKBANK', price: 1789.60, change: 23.80, changePercent: 1.35, volume: 1234568, sector: 'Banking', marketCap: 356000000000, peRatio: 16.5, eps: 108.4, week52High: 2065.10, week52Low: 1543.25 },
      
      // Auto
      { symbol: 'MARUTI', price: 9876.50, change: 45.25, changePercent: 0.46, volume: 567890, sector: 'Auto', marketCap: 298000000000, peRatio: 22.4, eps: 440.8, week52High: 12450.00, week52Low: 7893.25 },
      { symbol: 'TATAMOTORS', price: 456.75, change: -12.30, changePercent: -2.62, volume: 6789012, sector: 'Auto', marketCap: 149000000000, peRatio: 18.9, eps: 24.2, week52High: 633.15, week52Low: 315.40 },
      
      // Pharma
      { symbol: 'SUNPHARMA', price: 1089.45, change: 8.75, changePercent: 0.81, volume: 1234567, sector: 'Pharma', marketCap: 261000000000, peRatio: 28.6, eps: 38.1, week52High: 1287.35, week52Low: 789.20 },
      { symbol: 'DRREDDY', price: 5678.90, change: -23.45, changePercent: -0.41, volume: 345678, sector: 'Pharma', marketCap: 94500000000, peRatio: 18.4, eps: 308.7, week52High: 6543.25, week52Low: 4123.80 },
      
      // FMCG
      { symbol: 'HINDUNILVR', price: 2456.75, change: 15.25, changePercent: 0.62, volume: 789012, sector: 'FMCG', marketCap: 576000000000, peRatio: 58.9, eps: 41.7, week52High: 2934.95, week52Low: 2172.00 },
      { symbol: 'ITC', price: 345.80, change: -2.45, changePercent: -0.70, volume: 9876543, sector: 'FMCG', marketCap: 429000000000, peRatio: 26.8, eps: 12.9, week52High: 497.50, week52Low: 287.35 },
      
      // IT
      { symbol: 'WIPRO', price: 456.75, change: 8.90, changePercent: 1.98, volume: 2345678, sector: 'IT', marketCap: 249000000000, peRatio: 22.1, eps: 20.7, week52High: 687.35, week52Low: 387.20 },
      { symbol: 'HCLTECH', price: 1234.50, change: -5.75, changePercent: -0.46, volume: 1567890, sector: 'IT', marketCap: 335000000000, peRatio: 19.8, eps: 62.4, week52High: 1595.00, week52Low: 987.65 },
    ]

    // Add indices
    const indices = [
      { symbol: 'NIFTY', price: 19456.75, change: 123.45, changePercent: 0.64, volume: 0, sector: 'Index' },
      { symbol: 'BANKNIFTY', price: 43567.80, change: -234.56, changePercent: -0.53, volume: 0, sector: 'Index' },
      { symbol: 'FINNIFTY', price: 18765.25, change: 89.30, changePercent: 0.48, volume: 0, sector: 'Index' },
    ]

    const allData = [...sampleStocks, ...indices]
    
    allData.forEach(stock => {
      const dataPoint: MarketDataPoint = {
        ...stock,
        lastUpdated: new Date().toISOString(),
        rsi: this.calculateRSI(),
        macd: this.calculateMACD(),
        sma20: stock.price * (0.98 + Math.random() * 0.04),
        sma50: stock.price * (0.95 + Math.random() * 0.10)
      }
      this.mockData.set(stock.symbol, dataPoint)
      
      // Generate sample candle data
      this.generateCandleData(stock.symbol, stock.price)
    })
  }

  private generateCandleData(symbol: string, basePrice: number) {
    const candles: CandleData[] = []
    let currentPrice = basePrice
    
    // Generate 100 candles for different timeframes
    for (let i = 99; i >= 0; i--) {
      const time = new Date(Date.now() - i * 5 * 60 * 1000).toISOString() // 5-minute candles
      const volatility = 0.02 // 2% volatility
      
      const open = currentPrice
      const change = (Math.random() - 0.5) * volatility * currentPrice
      const close = open + change
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5
      const volume = Math.floor(Math.random() * 100000) + 10000
      
      candles.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      })
      
      currentPrice = close
    }
    
    this.candleData.set(symbol, candles)
  }

  private calculateRSI(): number {
    return 30 + Math.random() * 40 // RSI between 30-70
  }

  private calculateMACD(): number {
    return (Math.random() - 0.5) * 10 // MACD between -5 to 5
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updatePrices()
      this.notifySubscribers()
    }, 2000) // Update every 2 seconds
  }

  private updatePrices() {
    this.mockData.forEach((data, symbol) => {
      if (data.sector === 'Index') return // Don't update indices as frequently
      
      const volatility = 0.001 // 0.1% volatility per update
      const change = (Math.random() - 0.5) * volatility * data.price
      const newPrice = Math.max(0.01, data.price + change)
      const priceChange = newPrice - data.price
      const percentChange = (priceChange / data.price) * 100
      
      const updatedData: MarketDataPoint = {
        ...data,
        price: Number(newPrice.toFixed(2)),
        change: Number((data.change + priceChange).toFixed(2)),
        changePercent: Number(((data.change + priceChange) / (data.price - data.change) * 100).toFixed(2)),
        lastUpdated: new Date().toISOString(),
        rsi: this.calculateRSI(),
        macd: this.calculateMACD()
      }
      
      this.mockData.set(symbol, updatedData)
      
      // Update candle data
      this.updateCandleData(symbol, newPrice)
    })
  }

  private updateCandleData(symbol: string, newPrice: number) {
    const candles = this.candleData.get(symbol) || []
    if (candles.length === 0) return
    
    const lastCandle = candles[candles.length - 1]
    const now = new Date()
    const lastCandleTime = new Date(lastCandle.time)
    
    // If more than 5 minutes have passed, create a new candle
    if (now.getTime() - lastCandleTime.getTime() > 5 * 60 * 1000) {
      const newCandle: CandleData = {
        time: now.toISOString(),
        open: lastCandle.close,
        high: Math.max(lastCandle.close, newPrice),
        low: Math.min(lastCandle.close, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 50000) + 5000
      }
      candles.push(newCandle)
      
      // Keep only last 100 candles
      if (candles.length > 100) {
        candles.shift()
      }
    } else {
      // Update current candle
      lastCandle.close = newPrice
      lastCandle.high = Math.max(lastCandle.high, newPrice)
      lastCandle.low = Math.min(lastCandle.low, newPrice)
      lastCandle.volume += Math.floor(Math.random() * 1000)
    }
    
    this.candleData.set(symbol, candles)
  }

  private notifySubscribers() {
    const allData = Array.from(this.mockData.values())
    this.subscribers.forEach(callback => callback(allData))
  }

  // Public methods
  subscribe(callback: (data: MarketDataPoint[]) => void): () => void {
    this.subscribers.add(callback)
    // Immediately call with current data
    callback(Array.from(this.mockData.values()))
    
    return () => {
      this.subscribers.delete(callback)
    }
  }

  getAllStocks(): MarketDataPoint[] {
    return Array.from(this.mockData.values())
  }

  getStocksBySector(sector: string): MarketDataPoint[] {
    if (sector === 'All') {
      return this.getAllStocks().filter(stock => stock.sector !== 'Index')
    }
    
    const sectorSymbols = SECTORS[sector as keyof typeof SECTORS] || []
    return Array.from(this.mockData.values()).filter(stock => 
      sectorSymbols.includes(stock.symbol) || stock.sector === sector
    )
  }

  getIndices(): MarketDataPoint[] {
    return Array.from(this.mockData.values()).filter(stock => stock.sector === 'Index')
  }

  getStock(symbol: string): MarketDataPoint | undefined {
    return this.mockData.get(symbol)
  }

  getCandleData(symbol: string, timeframe: string = '5m'): CandleData[] {
    return this.candleData.get(symbol) || []
  }

  getTechnicalIndicators(symbol: string): TechnicalIndicators | null {
    const stock = this.mockData.get(symbol)
    if (!stock) return null
    
    const rsi = stock.rsi || 50
    const macd = stock.macd || 0
    const signal = macd * 0.8 // Simplified signal line
    const sma20 = stock.sma20 || stock.price
    const sma50 = stock.sma50 || stock.price
    
    let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
    if (rsi < 30 && macd > signal && stock.price > sma20) {
      recommendation = 'BUY'
    } else if (rsi > 70 && macd < signal && stock.price < sma20) {
      recommendation = 'SELL'
    }
    
    return {
      rsi: Number(rsi.toFixed(2)),
      macd: Number(macd.toFixed(2)),
      signal: Number(signal.toFixed(2)),
      sma20: Number(sma20.toFixed(2)),
      sma50: Number(sma50.toFixed(2)),
      recommendation
    }
  }

  getOptionChain(symbol: string): OptionChainData[] {
    const stock = this.mockData.get(symbol)
    if (!stock) return []
    
    const basePrice = stock.price
    const optionChain: OptionChainData[] = []
    
    // Generate option chain around current price
    for (let i = -10; i <= 10; i++) {
      const strikePrice = Math.round((basePrice + (basePrice * 0.02 * i)) / 50) * 50
      
      const callLTP = Math.max(0.05, basePrice - strikePrice + Math.random() * 50)
      const putLTP = Math.max(0.05, strikePrice - basePrice + Math.random() * 50)
      
      optionChain.push({
        strikePrice,
        callLTP: Number(callLTP.toFixed(2)),
        callOI: Math.floor(Math.random() * 100000) + 10000,
        callVolume: Math.floor(Math.random() * 50000) + 1000,
        callChange: Number(((Math.random() - 0.5) * 20).toFixed(2)),
        putLTP: Number(putLTP.toFixed(2)),
        putOI: Math.floor(Math.random() * 100000) + 10000,
        putVolume: Math.floor(Math.random() * 50000) + 1000,
        putChange: Number(((Math.random() - 0.5) * 20).toFixed(2))
      })
    }
    
    return optionChain.sort((a, b) => a.strikePrice - b.strikePrice)
  }

  searchStocks(query: string): MarketDataPoint[] {
    const searchTerm = query.toLowerCase()
    return Array.from(this.mockData.values()).filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm) ||
      stock.sector.toLowerCase().includes(searchTerm)
    )
  }

  isMarketOpen(): boolean {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes
    
    // Market hours: 9:15 AM to 3:30 PM (IST)
    const marketOpen = 9 * 60 + 15 // 9:15 AM
    const marketClose = 15 * 60 + 30 // 3:30 PM
    
    return currentTime >= marketOpen && currentTime <= marketClose
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
  }
}

export const marketDataService = new MarketDataService()