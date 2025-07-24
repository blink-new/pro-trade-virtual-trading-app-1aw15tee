import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Eye, TrendingUp, TrendingDown, X } from 'lucide-react-native'
import { marketDataService, MarketDataPoint } from '@/src/services/marketData'

export function Watchlist() {
  const [watchlistSymbols] = useState(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'])
  const [watchlistData, setWatchlistData] = useState<MarketDataPoint[]>([])

  useEffect(() => {
    loadWatchlistData()
    
    // Subscribe to real-time updates
    const unsubscribe = marketDataService.subscribe((data) => {
      const filteredData = data.filter(stock => watchlistSymbols.includes(stock.symbol))
      setWatchlistData(filteredData)
    })

    return unsubscribe
  }, [])

  const loadWatchlistData = () => {
    const data = watchlistSymbols.map(symbol => marketDataService.getStock(symbol)).filter(Boolean) as MarketDataPoint[]
    setWatchlistData(data)
  }

  const removeFromWatchlist = (symbol: string) => {
    // In a real app, this would update the database
    console.log('Remove from watchlist:', symbol)
  }

  if (watchlistData.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Eye size={48} color="#9ca3af" />
        <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">Empty Watchlist</Text>
        <Text className="text-gray-500 text-center">
          Add stocks to your watchlist to track them here
        </Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 px-4 py-4">
      {watchlistData.map((stock) => {
        const changeColor = stock.change >= 0 ? 'text-green-600' : 'text-red-600'
        const changeBgColor = stock.change >= 0 ? 'bg-green-50' : 'bg-red-50'

        return (
          <View key={stock.symbol} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-bold text-gray-900">{stock.symbol}</Text>
                  <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                    <Text className="text-xs text-blue-600 font-medium">{stock.sector}</Text>
                  </View>
                </View>
                
                <Text className="text-2xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => removeFromWatchlist(stock.symbol)}
                className="p-2"
              >
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between">
              <View className={`flex-row items-center px-3 py-1 rounded ${changeBgColor}`}>
                {stock.change >= 0 ? (
                  <TrendingUp size={16} color="#16a34a" />
                ) : (
                  <TrendingDown size={16} color="#dc2626" />
                )}
                <Text className={`text-sm font-medium ml-1 ${changeColor}`}>
                  {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </Text>
              </View>

              <Text className="text-sm text-gray-500">
                Vol: {stock.volume.toLocaleString()}
              </Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}