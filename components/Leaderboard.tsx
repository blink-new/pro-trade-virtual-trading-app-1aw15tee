import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react-native'

interface LeaderboardUser {
  id: string
  displayName: string
  totalPnL: number
  winRate: number
  totalTrades: number
  rank: number
}

export function Leaderboard() {
  const [users] = useState<LeaderboardUser[]>([
    {
      id: '1',
      displayName: 'TradingPro',
      totalPnL: 15750.25,
      winRate: 85.2,
      totalTrades: 127,
      rank: 1
    },
    {
      id: '2',
      displayName: 'StockMaster',
      totalPnL: 12340.80,
      winRate: 78.9,
      totalTrades: 95,
      rank: 2
    },
    {
      id: '3',
      displayName: 'MarketGuru',
      totalPnL: 9876.50,
      winRate: 72.1,
      totalTrades: 83,
      rank: 3
    },
    {
      id: '4',
      displayName: 'InvestorAce',
      totalPnL: 8765.30,
      winRate: 69.4,
      totalTrades: 76,
      rank: 4
    },
    {
      id: '5',
      displayName: 'TradingKing',
      totalPnL: 7654.20,
      winRate: 65.8,
      totalTrades: 68,
      rank: 5
    }
  ])

  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'all'>('all')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#ffd700" />
      case 2:
        return <Medal size={24} color="#c0c0c0" />
      case 3:
        return <Award size={24} color="#cd7f32" />
      default:
        return (
          <View className="w-6 h-6 bg-gray-200 rounded-full items-center justify-center">
            <Text className="text-xs font-bold text-gray-600">{rank}</Text>
          </View>
        )
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200'
      case 2:
        return 'bg-gray-50 border-gray-200'
      case 3:
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-white border-gray-100'
    }
  }

  return (
    <View className="flex-1">
      {/* Period Selector */}
      <View className="flex-row bg-gray-100 rounded-lg p-1 mx-4 mb-4">
        {(['weekly', 'monthly', 'all'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            className={`flex-1 py-2 rounded-md ${
              selectedPeriod === period ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium capitalize ${
              selectedPeriod === period ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4">
        {users.map((user, index) => (
          <View
            key={user.id}
            className={`rounded-xl p-4 mb-3 border ${getRankColor(user.rank)} shadow-sm`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                {getRankIcon(user.rank)}
                <View className="ml-3">
                  <Text className="text-lg font-bold text-gray-900">{user.displayName}</Text>
                  <Text className="text-sm text-gray-500">Rank #{user.rank}</Text>
                </View>
              </View>
              
              <View className="items-end">
                <View className="flex-row items-center">
                  <TrendingUp size={16} color="#16a34a" />
                  <Text className="text-lg font-bold text-green-600 ml-1">
                    ₹{user.totalPnL.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">Total P&L</Text>
              </View>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-sm text-gray-500">Win Rate</Text>
                <Text className="text-lg font-bold text-blue-600">{user.winRate.toFixed(1)}%</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-gray-500">Total Trades</Text>
                <Text className="text-lg font-bold text-purple-600">{user.totalTrades}</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-gray-500">Avg P&L</Text>
                <Text className="text-lg font-bold text-orange-600">
                  ₹{(user.totalPnL / user.totalTrades).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}