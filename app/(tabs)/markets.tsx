import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Search, TrendingUp, TrendingDown, Eye, EyeOff, ShoppingCart, DollarSign } from 'lucide-react-native'
import { marketDataService, MarketDataPoint, SECTORS } from '@/src/services/marketData'
import blink from '@/src/blink/client'

const sectorTabs = ['All', 'Nifty50', 'BankNifty', 'Auto', 'Pharma', 'FMCG', 'IT']

export default function MarketsScreen() {
  const [selectedSector, setSelectedSector] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [stocks, setStocks] = useState<MarketDataPoint[]>([])
  const [indices, setIndices] = useState<MarketDataPoint[]>([])
  const [filteredStocks, setFilteredStocks] = useState<MarketDataPoint[]>([])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [marketOpen, setMarketOpen] = useState(false)

  useEffect(() => {
    loadInitialData()
    
    // Subscribe to real-time updates
    const unsubscribe = marketDataService.subscribe((data) => {
      const stockData = data.filter(item => item.sector !== 'Index')
      const indexData = data.filter(item => item.sector === 'Index')
      setStocks(stockData)
      setIndices(indexData)
    })

    // Check market status
    setMarketOpen(marketDataService.isMarketOpen())
    const marketInterval = setInterval(() => {
      setMarketOpen(marketDataService.isMarketOpen())
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(marketInterval)
    }
  }, [])

  useEffect(() => {
    filterStocks()
  }, [selectedSector, searchQuery, stocks])

  const loadInitialData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)

      // Mock watchlist
      setWatchlist(['RELIANCE', 'TCS', 'HDFCBANK'])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const filterStocks = () => {
    let filtered = stocks

    // Filter by sector
    if (selectedSector !== 'All') {
      filtered = marketDataService.getStocksBySector(selectedSector)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredStocks(filtered)
  }

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(prev => prev.filter(s => s !== symbol))
      Alert.alert('Removed', `${symbol} removed from watchlist`)
    } else {
      setWatchlist(prev => [...prev, symbol])
      Alert.alert('Added', `${symbol} added to watchlist`)
    }
  }

  const executeTrade = (symbol: string, type: 'BUY' | 'SELL', price: number) => {
    if (!marketOpen) {
      Alert.alert('Market Closed', 'Trading is only allowed during market hours (9:15 AM - 3:30 PM)')
      return
    }

    Alert.alert(
      `${type} ${symbol}`,
      `Execute ${type} order at ₹${price.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Trade Executed', `${type} 1 ${symbol} at ₹${price.toFixed(2)}`)
          }
        }
      ]
    )
  }

  const renderStockItem = (stock: MarketDataPoint) => {
    const isInWatchlist = watchlist.includes(stock.symbol)
    const changeColor = stock.change >= 0 ? 'text-green-600' : 'text-red-600'
    const changeBgColor = stock.change >= 0 ? 'bg-green-50' : 'bg-red-50'

    return (
      <View key={stock.symbol} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <TouchableOpacity className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-gray-900">{stock.symbol}</Text>
              <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                <Text className="text-xs text-blue-600 font-medium">{stock.sector}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-gray-900">₹{stock.price.toFixed(2)}</Text>
              <View className={`ml-3 px-2 py-1 rounded ${changeBgColor}`}>
                <Text className={`text-sm font-medium ${changeColor}`}>
                  {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleWatchlist(stock.symbol)}
            className="p-2"
          >
            {isInWatchlist ? (
              <Eye size={24} color="#3b82f6" />
            ) : (
              <EyeOff size={24} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-3 py-2 border-t border-gray-100">
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Volume</Text>
            <Text className="text-sm font-medium text-gray-900">
              {stock.volume.toLocaleString()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Market Cap</Text>
            <Text className="text-sm font-medium text-gray-900">
              {stock.marketCap ? `₹${(stock.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500">P/E</Text>
            <Text className="text-sm font-medium text-gray-900">
              {stock.peRatio?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => executeTrade(stock.symbol, 'BUY', stock.price)}
            className="flex-1 bg-green-500 rounded-lg py-3 flex-row items-center justify-center"
            disabled={!marketOpen}
          >
            <ShoppingCart size={16} color="white" />
            <Text className="text-white font-bold ml-2">BUY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => executeTrade(stock.symbol, 'SELL', stock.price)}
            className="flex-1 bg-red-500 rounded-lg py-3 flex-row items-center justify-center"
            disabled={!marketOpen}
          >
            <DollarSign size={16} color="white" />
            <Text className="text-white font-bold ml-2">SELL</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Markets</Text>
          <View className={`px-3 py-1 rounded-full ${marketOpen ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-sm font-medium ${marketOpen ? 'text-green-600' : 'text-red-600'}`}>
              {marketOpen ? '● Market Open' : '● Market Closed'}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Search size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search stocks, sectors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {sectorTabs.map((sector) => (
              <TouchableOpacity
                key={sector}
                onPress={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-full ${
                  selectedSector === sector
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  selectedSector === sector
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {sector}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Indices */}
        {selectedSector === 'All' && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Market Indices</Text>
            <View className="flex-row justify-between">
              {indices.map((index) => (
                <View key={index.symbol} className="flex-1 bg-white rounded-xl p-4 mx-1 shadow-sm">
                  <Text className="text-sm font-medium text-gray-600 mb-1">{index.symbol}</Text>
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {index.price.toFixed(2)}
                  </Text>
                  <View className="flex-row items-center">
                    {index.change >= 0 ? (
                      <TrendingUp size={12} color="#16a34a" />
                    ) : (
                      <TrendingDown size={12} color="#dc2626" />
                    )}
                    <Text className={`text-xs font-medium ml-1 ${
                      index.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {index.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stocks */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            {selectedSector === 'All' ? 'All Stocks' : `${selectedSector} Stocks`}
            <Text className="text-sm text-gray-500 font-normal"> ({filteredStocks.length})</Text>
          </Text>
          
          {filteredStocks.map(renderStockItem)}
        </View>
      </ScrollView>
    </View>
  )
}