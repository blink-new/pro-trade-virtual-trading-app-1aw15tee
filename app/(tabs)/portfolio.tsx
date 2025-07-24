import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react-native'
import blink from '@/src/blink/client'

interface MockPosition {
  id: string
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  sector: string
}

interface MockTrade {
  id: string
  symbol: string
  type: string
  quantity: number
  price: number
  totalAmount: number
  brokerage: number
  netAmount: number
  tradeDate: string
  sector: string
}

export default function PortfolioScreen() {
  const [user, setUser] = useState<any>(null)
  const [positions] = useState<MockPosition[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      quantity: 10,
      avgPrice: 2400.50,
      currentPrice: 2456.75,
      pnl: 562.50,
      sector: 'Energy'
    },
    {
      id: '2',
      symbol: 'TCS',
      quantity: 5,
      avgPrice: 3300.00,
      currentPrice: 3245.80,
      pnl: -271.00,
      sector: 'IT'
    },
    {
      id: '3',
      symbol: 'HDFCBANK',
      quantity: 8,
      avgPrice: 1650.25,
      currentPrice: 1678.90,
      pnl: 229.20,
      sector: 'Banking'
    }
  ])
  
  const [trades] = useState<MockTrade[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      type: 'BUY',
      quantity: 10,
      price: 2400.50,
      totalAmount: 24005.00,
      brokerage: 20.00,
      netAmount: 24025.00,
      tradeDate: new Date().toISOString(),
      sector: 'Energy'
    },
    {
      id: '2',
      symbol: 'TCS',
      type: 'BUY',
      quantity: 5,
      price: 3300.00,
      totalAmount: 16500.00,
      brokerage: 20.00,
      netAmount: 16520.00,
      tradeDate: new Date(Date.now() - 86400000).toISOString(),
      sector: 'IT'
    }
  ])

  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'positions' | 'trades'>('positions')

  const stats = {
    totalValue: positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0),
    totalPnL: positions.reduce((sum, pos) => sum + pos.pnl, 0),
    totalInvested: positions.reduce((sum, pos) => sum + (pos.avgPrice * pos.quantity), 0),
    totalBrokerage: trades.reduce((sum, trade) => sum + trade.brokerage, 0),
    dayPnL: 125.50 // Mock day P&L
  }

  const netPnL = stats.totalPnL - stats.totalBrokerage
  const totalPnLPercent = stats.totalInvested > 0 ? (stats.totalPnL / stats.totalInvested) * 100 : 0

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)
    } catch (error) {
      console.error('Error loading portfolio data:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPortfolioData()
    setRefreshing(false)
  }

  const renderPosition = (position: MockPosition) => {
    const pnlColor = position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
    const pnlBgColor = position.pnl >= 0 ? 'bg-green-50' : 'bg-red-50'
    const pnlPercent = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100

    return (
      <View key={position.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-gray-900">{position.symbol}</Text>
              <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                <Text className="text-xs text-blue-600 font-medium">{position.sector}</Text>
              </View>
            </View>
            
            <Text className="text-sm text-gray-500">
              {position.quantity} shares • Avg: ₹{position.avgPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-sm text-gray-500">Current Price</Text>
            <Text className="text-xl font-bold text-gray-900">₹{position.currentPrice.toFixed(2)}</Text>
          </View>
          
          <View className="items-end">
            <Text className="text-sm text-gray-500">P&L</Text>
            <View className={`px-3 py-1 rounded ${pnlBgColor}`}>
              <Text className={`text-lg font-bold ${pnlColor}`}>
                ₹{position.pnl.toFixed(2)}
              </Text>
              <Text className={`text-sm ${pnlColor} text-center`}>
                ({pnlPercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between pt-3 border-t border-gray-100">
          <View>
            <Text className="text-xs text-gray-500">Invested</Text>
            <Text className="text-sm font-medium text-gray-900">
              ₹{(position.avgPrice * position.quantity).toFixed(2)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Current Value</Text>
            <Text className="text-sm font-medium text-gray-900">
              ₹{(position.currentPrice * position.quantity).toFixed(2)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Type</Text>
            <Text className="text-sm font-medium text-gray-900">STOCK</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderTrade = (trade: MockTrade) => {
    const tradeColor = trade.type === 'BUY' ? 'text-blue-600' : 'text-orange-600'
    const tradeBgColor = trade.type === 'BUY' ? 'bg-blue-50' : 'bg-orange-50'

    return (
      <View key={trade.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-bold text-gray-900">{trade.symbol}</Text>
              <View className={`ml-2 px-2 py-1 rounded ${tradeBgColor}`}>
                <Text className={`text-xs font-medium ${tradeColor}`}>{trade.type}</Text>
              </View>
            </View>
            
            <Text className="text-sm text-gray-500">
              {trade.quantity} shares • ₹{trade.price.toFixed(2)}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-sm text-gray-500">Net Amount</Text>
            <Text className="text-lg font-bold text-gray-900">
              ₹{trade.netAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
          <View className="flex-row items-center">
            <Clock size={14} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {new Date(trade.tradeDate).toLocaleDateString()} {new Date(trade.tradeDate).toLocaleTimeString()}
            </Text>
          </View>
          
          {trade.brokerage > 0 && (
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">Brokerage: </Text>
              <Text className="text-xs font-medium text-red-600">₹{trade.brokerage.toFixed(2)}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Portfolio</Text>
        
        {/* Portfolio Stats */}
        <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-900">Total Portfolio Value</Text>
            <Text className="text-2xl font-bold text-blue-600">₹{stats.totalValue.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Total P&L</Text>
              <View className="flex-row items-center">
                {stats.totalPnL >= 0 ? (
                  <TrendingUp size={16} color="#16a34a" />
                ) : (
                  <TrendingDown size={16} color="#dc2626" />
                )}
                <Text className={`text-lg font-bold ml-1 ${
                  stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{stats.totalPnL.toFixed(2)}
                </Text>
                <Text className={`text-sm ml-2 ${
                  stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ({totalPnLPercent.toFixed(2)}%)
                </Text>
              </View>
            </View>
            
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">Net P&L (After Brokerage)</Text>
              <Text className={`text-lg font-bold ${
                netPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{netPnL.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Stats */}
        <View className="flex-row justify-between">
          <View className="flex-1 bg-white rounded-lg p-3 mr-2 shadow-sm">
            <Text className="text-xs text-gray-500">Invested</Text>
            <Text className="text-lg font-bold text-gray-900">₹{stats.totalInvested.toFixed(2)}</Text>
          </View>
          
          <View className="flex-1 bg-white rounded-lg p-3 mx-1 shadow-sm">
            <Text className="text-xs text-gray-500">Day P&L</Text>
            <Text className={`text-lg font-bold ${
              stats.dayPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{stats.dayPnL.toFixed(2)}
            </Text>
          </View>
          
          <View className="flex-1 bg-white rounded-lg p-3 ml-2 shadow-sm">
            <Text className="text-xs text-gray-500">Total Brokerage</Text>
            <Text className="text-lg font-bold text-red-600">₹{stats.totalBrokerage.toFixed(2)}</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mt-4 bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setSelectedTab('positions')}
            className={`flex-1 py-2 rounded-md ${
              selectedTab === 'positions' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              selectedTab === 'positions' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Positions ({positions.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSelectedTab('trades')}
            className={`flex-1 py-2 rounded-md ${
              selectedTab === 'trades' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              selectedTab === 'trades' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Trade History ({trades.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'positions' ? (
          positions.length > 0 ? (
            positions.map(renderPosition)
          ) : (
            <View className="bg-white rounded-xl p-8 items-center shadow-sm">
              <BarChart3 size={48} color="#9ca3af" />
              <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">No Positions</Text>
              <Text className="text-gray-500 text-center">
                Start trading to see your positions here
              </Text>
            </View>
          )
        ) : (
          trades.length > 0 ? (
            trades.map(renderTrade)
          ) : (
            <View className="bg-white rounded-xl p-8 items-center shadow-sm">
              <Clock size={48} color="#9ca3af" />
              <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">No Trade History</Text>
              <Text className="text-gray-500 text-center">
                Your trade history will appear here
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  )
}