import { useState, useEffect } from 'react'
import { marketDataService, MarketDataPoint } from '../services/marketData'

export function useMarketData() {
  const [stocks, setStocks] = useState<MarketDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [isMarketOpen, setIsMarketOpen] = useState(false)

  useEffect(() => {
    // Initial load
    const initialStocks = marketDataService.getAllStocks()
    setStocks(initialStocks)
    setIsMarketOpen(marketDataService.isMarketOpen())
    setLoading(false)

    // Subscribe to updates
    const unsubscribe = marketDataService.subscribe((data) => {
      setStocks(data)
    })

    // Update market status every minute
    const marketInterval = setInterval(() => {
      setIsMarketOpen(marketDataService.isMarketOpen())
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(marketInterval)
    }
  }, [])

  return {
    stocks,
    loading,
    isMarketOpen,
    getStock: (symbol: string) => marketDataService.getStock(symbol),
    getStocksBySector: (sector: string) => marketDataService.getStocksBySector(sector),
    getIndices: () => marketDataService.getIndices(),
    getAllStocks: () => marketDataService.getAllStocks()
  }
}