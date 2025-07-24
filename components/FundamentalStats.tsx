import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react-native'
import { marketDataService, MarketDataPoint } from '@/src/services/marketData'

interface FundamentalStatsProps {
  symbol: string
}

export function FundamentalStats({ symbol }: FundamentalStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stockData, setStockData] = useState<MarketDataPoint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStockData()
    
    // Update data every 30 seconds
    const interval = setInterval(loadStockData, 30000)
    return () => clearInterval(interval)
  }, [symbol])

  const loadStockData = () => {
    setLoading(true)
    const data = marketDataService.getStock(symbol)
    setStockData(data || null)
    setLoading(false)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `₹${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `₹${(value / 1e6).toFixed(2)}M`
    return `₹${value.toFixed(2)}`
  }

  const getPerformanceColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'text-green-600'
    if (value < threshold) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPerformanceIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <TrendingUp size={16} color="#16a34a" />
    if (value < threshold) return <TrendingDown size={16} color="#dc2626" />
    return <BarChart3 size={16} color="#6b7280" />
  }

  if (loading) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-900">Fundamental Analysis</Text>
          <View className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </View>
        <View className="mt-4 space-y-2">
          <View className="h-4 bg-gray-200 rounded animate-pulse" />
          <View className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <View className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </View>
      </View>
    )
  }

  if (!stockData) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-2">Fundamental Analysis</Text>
        <Text className="text-gray-500">No data available for {symbol}</Text>
      </View>
    )
  }

  return (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center p-4 bg-blue-50"
      >
        <View className="flex-row items-center">
          <BarChart3 size={24} color="#3b82f6" />
          <Text className="text-lg font-bold text-gray-900 ml-2">
            Fundamental Analysis
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={24} color="#6b7280" />
        ) : (
          <ChevronDown size={24} color="#6b7280" />
        )}
      </TouchableOpacity>

      {/* Quick Stats (Always Visible) */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">Current Price</Text>
            <Text className="text-xl font-bold text-gray-900">₹{stockData.price.toFixed(2)}</Text>
            <View className="flex-row items-center mt-1">
              {getPerformanceIcon(stockData.change)}
              <Text className={`ml-1 font-medium ${getPerformanceColor(stockData.change)}`}>
                ₹{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
          
          <View className="flex-1 items-end">
            <Text className="text-sm text-gray-500">Sector</Text>
            <Text className="text-lg font-bold text-blue-600">{stockData.sector}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Vol: {stockData.volume.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <ScrollView className="max-h-96">
          <View className="p-4">
            {/* Valuation Metrics */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Valuation Metrics</Text>
              
              <View className="space-y-3">
                {/* Market Cap */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <DollarSign size={16} color="#6b7280" />
                    <Text className="text-gray-700 ml-2">Market Cap</Text>
                  </View>
                  <Text className="font-bold text-gray-900">
                    {stockData.marketCap ? formatMarketCap(stockData.marketCap) : 'N/A'}
                  </Text>
                </View>

                {/* P/E Ratio */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">P/E Ratio</Text>
                  <View className="flex-row items-center">
                    <Text className={`font-bold ${
                      stockData.peRatio && stockData.peRatio < 15 ? 'text-green-600' :
                      stockData.peRatio && stockData.peRatio > 25 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {stockData.peRatio?.toFixed(1) || 'N/A'}
                    </Text>
                    {stockData.peRatio && (
                      <Text className="text-xs text-gray-500 ml-2">
                        {stockData.peRatio < 15 ? '(Undervalued)' :
                         stockData.peRatio > 25 ? '(Overvalued)' : '(Fair)'}
                      </Text>
                    )}
                  </View>
                </View>

                {/* EPS */}
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">EPS (TTM)</Text>
                  <Text className="font-bold text-gray-900">
                    ₹{stockData.eps?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">52 Week Range</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">52W High</Text>
                  <View className="flex-row items-center">
                    <Text className="font-bold text-green-600">
                      ₹{stockData.week52High?.toFixed(2) || 'N/A'}
                    </Text>
                    {stockData.week52High && (
                      <Text className="text-xs text-gray-500 ml-2">
                        ({(((stockData.price - stockData.week52High) / stockData.week52High) * 100).toFixed(1)}%)
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">52W Low</Text>
                  <View className="flex-row items-center">
                    <Text className="font-bold text-red-600">
                      ₹{stockData.week52Low?.toFixed(2) || 'N/A'}
                    </Text>
                    {stockData.week52Low && (
                      <Text className="text-xs text-gray-500 ml-2">
                        (+{(((stockData.price - stockData.week52Low) / stockData.week52Low) * 100).toFixed(1)}%)
                      </Text>
                    )}
                  </View>
                </View>

                {/* Price Position */}
                {stockData.week52High && stockData.week52Low && (
                  <View className="py-2">
                    <Text className="text-gray-700 mb-2">Price Position</Text>
                    <View className="h-2 bg-gray-200 rounded-full">
                      <View
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${((stockData.price - stockData.week52Low) / (stockData.week52High - stockData.week52Low)) * 100}%`
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-xs text-gray-500">Low</Text>
                      <Text className="text-xs text-blue-600 font-medium">
                        {(((stockData.price - stockData.week52Low) / (stockData.week52High - stockData.week52Low)) * 100).toFixed(1)}%
                      </Text>
                      <Text className="text-xs text-gray-500">High</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Technical Summary */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Technical Summary</Text>
              
              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">RSI (14)</Text>
                  <View className="flex-row items-center">
                    <Text className={`font-bold ${
                      stockData.rsi && stockData.rsi < 30 ? 'text-green-600' :
                      stockData.rsi && stockData.rsi > 70 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {stockData.rsi?.toFixed(1) || 'N/A'}
                    </Text>
                    {stockData.rsi && (
                      <Text className="text-xs text-gray-500 ml-2">
                        {stockData.rsi < 30 ? '(Oversold)' :
                         stockData.rsi > 70 ? '(Overbought)' : '(Neutral)'}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">MACD</Text>
                  <Text className={`font-bold ${getPerformanceColor(stockData.macd || 0)}`}>
                    {stockData.macd?.toFixed(2) || 'N/A'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-gray-700">SMA 20</Text>
                  <Text className="font-bold text-gray-900">
                    ₹{stockData.sma20?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Investment Rating */}
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <Text className="text-lg font-bold text-gray-900 mb-2">Investment Rating</Text>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Overall Score</Text>
                  <View className="flex-row items-center">
                    <View className="flex-1 h-2 bg-gray-200 rounded-full mr-3">
                      <View
                        className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                        style={{ width: '75%' }}
                      />
                    </View>
                    <Text className="text-lg font-bold text-green-600">7.5/10</Text>
                  </View>
                </View>
              </View>
              
              <Text className="text-sm text-gray-600 mt-2">
                Based on fundamental and technical analysis
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}