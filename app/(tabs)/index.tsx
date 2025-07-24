import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { TrendingUp, TrendingDown, Eye, BarChart3, Gift, Trophy } from 'lucide-react-native'
import { WalletCard } from '@/components/WalletCard'
import { QuickActions } from '@/components/QuickActions'
import { MarketOverview } from '@/components/MarketOverview'
import blink from '@/src/blink/client'
import { marketDataService } from '@/src/services/marketData'

interface DashboardStats {
  totalPnL: number
  totalTrades: number
  winRate: number
  todayPnL: number
  activePositions: number
  watchlistCount: number
}

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalPnL: 0,
    totalTrades: 0,
    winRate: 0,
    todayPnL: 0,
    activePositions: 0,
    watchlistCount: 0
  })
  const [marketOpen, setMarketOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Check market status
    setMarketOpen(marketDataService.isMarketOpen())
    
    // Update market status every minute
    const interval = setInterval(() => {
      setMarketOpen(marketDataService.isMarketOpen())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)

      // Mock stats for now
      setStats({
        totalPnL: 2500.75,
        totalTrades: 15,
        winRate: 73.3,
        todayPnL: 450.25,
        activePositions: 3,
        watchlistCount: 8
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-2xl font-bold text-gray-900">PRO TRADE</Text>
            <Text className="text-gray-500">
              {getGreeting()}, {user?.display_name || user?.email?.split('@')[0] || 'Trader'}!
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${marketOpen ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-sm font-medium ${marketOpen ? 'text-green-600' : 'text-red-600'}`}>
              {marketOpen ? '● Live' : '● Closed'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Card */}
        <View className="px-4 py-4">
          <WalletCard 
            balance={user?.virtual_balance || 100000}
            totalPnL={stats.totalPnL}
            todayPnL={stats.todayPnL}
          />
        </View>

        {/* Quick Stats */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Today's Overview</Text>
            
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-blue-600">{stats.activePositions}</Text>
                <Text className="text-gray-500 text-sm">Active Positions</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-purple-600">{stats.totalTrades}</Text>
                <Text className="text-gray-500 text-sm">Total Trades</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-orange-600">{stats.winRate.toFixed(1)}%</Text>
                <Text className="text-gray-500 text-sm">Win Rate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-4">
          <QuickActions />
        </View>

        {/* Market Overview */}
        <View className="px-4 mb-4">
          <MarketOverview />
        </View>

        {/* Action Cards */}
        <View className="px-4 mb-4">
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Eye size={24} color="#3B82F6" />
                <Text className="text-2xl font-bold text-blue-600">{stats.watchlistCount}</Text>
              </View>
              <Text className="text-gray-900 font-medium">Watchlist</Text>
              <Text className="text-gray-500 text-sm">Stocks you're tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Trophy size={24} color="#F59E0B" />
                <Text className="text-2xl font-bold text-yellow-600">#42</Text>
              </View>
              <Text className="text-gray-900 font-medium">Leaderboard</Text>
              <Text className="text-gray-500 text-sm">Your ranking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Chart Placeholder */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">Portfolio Performance</Text>
              <BarChart3 size={20} color="#6B7280" />
            </View>
            
            <View className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg items-center justify-center">
              <BarChart3 size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">Chart coming soon</Text>
            </View>
            
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stats.totalPnL.toFixed(2)}
                </Text>
                <Text className="text-gray-500 text-sm">Total P&L</Text>
              </View>
              <View className="items-center">
                <Text className={`text-lg font-bold ${stats.todayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stats.todayPnL.toFixed(2)}
                </Text>
                <Text className="text-gray-500 text-sm">Today's P&L</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market News */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-3">Market News</Text>
            
            <View className="space-y-3">
              <View className="border-l-4 border-blue-500 pl-3">
                <Text className="text-gray-900 font-medium">Market Update</Text>
                <Text className="text-gray-500 text-sm">
                  Nifty 50 shows strong momentum in today's trading session
                </Text>
                <Text className="text-gray-400 text-xs mt-1">2 hours ago</Text>
              </View>
              
              <View className="border-l-4 border-green-500 pl-3">
                <Text className="text-gray-900 font-medium">Sector Focus</Text>
                <Text className="text-gray-500 text-sm">
                  Banking stocks outperform broader market indices
                </Text>
                <Text className="text-gray-400 text-xs mt-1">4 hours ago</Text>
              </View>
              
              <View className="border-l-4 border-purple-500 pl-3">
                <Text className="text-gray-900 font-medium">Options Activity</Text>
                <Text className="text-gray-500 text-sm">
                  High volatility expected in upcoming expiry
                </Text>
                <Text className="text-gray-400 text-xs mt-1">6 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}