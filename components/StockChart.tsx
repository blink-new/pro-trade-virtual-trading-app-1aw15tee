import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native'
import { marketDataService, CandleData, TechnicalIndicators } from '@/src/services/marketData'

interface StockChartProps {
  symbol: string
  height?: number
}

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '1h', value: '1h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' }
]

export function StockChart({ symbol, height = 300 }: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m')
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null)
  const [showIndicators, setShowIndicators] = useState(false)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    loadChartData()
    
    // Update chart data every 5 seconds
    const interval = setInterval(loadChartData, 5000)
    return () => clearInterval(interval)
  }, [symbol, selectedTimeframe])

  const loadChartData = () => {
    const data = marketDataService.getCandleData(symbol, selectedTimeframe)
    setCandleData(data)
    
    const indicators = marketDataService.getTechnicalIndicators(symbol)
    setTechnicalData(indicators)
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-600'
      case 'SELL': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return <TrendingUp size={16} color="#16a34a" />
      case 'SELL': return <TrendingDown size={16} color="#dc2626" />
      default: return <BarChart3 size={16} color="#ca8a04" />
    }
  }

  // Simple candlestick chart representation using React Native components
  const renderCandlestickChart = () => {
    if (candleData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center bg-gray-50 rounded-lg">
          <BarChart3 size={48} color="#9CA3AF" />
          <Text className="text-gray-500 mt-2">Loading chart data...</Text>
        </View>
      )
    }

    const screenWidth = Dimensions.get('window').width - 32 // Account for padding
    const chartWidth = screenWidth - 40
    const candleWidth = Math.max(2, chartWidth / candleData.length - 1)
    
    // Calculate price range
    const prices = candleData.flatMap(candle => [candle.high, candle.low])
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const priceRange = maxPrice - minPrice
    
    return (
      <View className="bg-white rounded-lg p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-900">{symbol}</Text>
          <View className="flex-row">
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                onPress={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1 rounded-md mr-2 ${
                  selectedTimeframe === tf.value
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedTimeframe === tf.value
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Area */}
        <View style={{ height: height - 100 }} className="border border-gray-200 rounded-lg p-2">
          <View className="flex-row h-full">
            {candleData.slice(-50).map((candle, index) => {
              const bodyHeight = Math.abs(candle.close - candle.open) / priceRange * (height - 120)
              const wickHeight = (candle.high - candle.low) / priceRange * (height - 120)
              const isGreen = candle.close > candle.open
              
              return (
                <View key={index} className="flex-1 justify-end items-center mx-0.5">
                  {/* Wick */}
                  <View
                    style={{
                      width: 1,
                      height: wickHeight,
                      backgroundColor: isGreen ? '#16a34a' : '#dc2626'
                    }}
                  />
                  {/* Body */}
                  <View
                    style={{
                      width: Math.max(candleWidth, 3),
                      height: Math.max(bodyHeight, 2),
                      backgroundColor: isGreen ? '#16a34a' : '#dc2626',
                      marginTop: -wickHeight / 2
                    }}
                  />
                </View>
              )
            })}
          </View>
        </View>

        {/* Price Info */}
        <View className="flex-row justify-between mt-4">
          <View>
            <Text className="text-sm text-gray-500">Current Price</Text>
            <Text className="text-lg font-bold text-gray-900">
              ₹{candleData[candleData.length - 1]?.close.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Volume</Text>
            <Text className="text-lg font-bold text-gray-900">
              {(candleData[candleData.length - 1]?.volume || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Technical Indicators Toggle */}
        <TouchableOpacity
          onPress={() => setShowIndicators(!showIndicators)}
          className="mt-4 py-2 px-4 bg-blue-50 rounded-lg"
        >
          <Text className="text-blue-600 font-medium text-center">
            {showIndicators ? 'Hide' : 'Show'} Technical Indicators
          </Text>
        </TouchableOpacity>

        {/* Technical Indicators */}
        {showIndicators && technicalData && (
          <View className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg font-bold text-gray-900 mb-3">Technical Analysis</Text>
            
            <View className="space-y-3">
              {/* Recommendation */}
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700 font-medium">Recommendation</Text>
                <View className="flex-row items-center">
                  {getRecommendationIcon(technicalData.recommendation)}
                  <Text className={`ml-2 font-bold ${getRecommendationColor(technicalData.recommendation)}`}>
                    {technicalData.recommendation}
                  </Text>
                </View>
              </View>

              {/* RSI */}
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">RSI (14)</Text>
                <View className="flex-row items-center">
                  <Text className={`font-bold ${
                    technicalData.rsi < 30 ? 'text-green-600' : 
                    technicalData.rsi > 70 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {technicalData.rsi.toFixed(1)}
                  </Text>
                  <Text className="text-gray-500 ml-2">
                    {technicalData.rsi < 30 ? '(Oversold)' : 
                     technicalData.rsi > 70 ? '(Overbought)' : '(Neutral)'}
                  </Text>
                </View>
              </View>

              {/* MACD */}
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">MACD</Text>
                <View className="flex-row items-center">
                  <Text className={`font-bold ${
                    technicalData.macd > technicalData.signal ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {technicalData.macd.toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 ml-2">
                    Signal: {technicalData.signal.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Moving Averages */}
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">SMA 20</Text>
                <Text className="font-bold text-gray-900">₹{technicalData.sma20.toFixed(2)}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">SMA 50</Text>
                <Text className="font-bold text-gray-900">₹{technicalData.sma50.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={{ height }}>
      {renderCandlestickChart()}
    </View>
  )
}