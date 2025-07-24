import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native'
import { User, Settings, Gift, Trophy, DollarSign, Moon, Sun, Bell, LogOut, Share2 } from 'lucide-react-native'
import blink from '@/src/blink/client'

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null)
  const [userStats] = useState({
    totalTrades: 15,
    totalPnL: 2500.75,
    winRate: 73.3,
    bestTrade: 850.25,
    worstTrade: -125.50,
    totalBrokerage: 300.00,
    netPnL: 2200.75,
    rank: 42,
    leaderboardPoints: 1250
  })
  
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEnabled: true,
    brokerageSimulation: true
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const userData = await blink.auth.me()
      setUser(userData)
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // In a real app, this would update the database
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            blink.auth.logout()
          }
        }
      ]
    )
  }

  const shareApp = () => {
    Alert.alert(
      'Share PRO TRADE',
      '🚀 Check out PRO TRADE - Virtual Stock Trading App!\n\n' +
      '✅ Learn stock trading risk-free\n' +
      '✅ Real-time market data\n' +
      '✅ Virtual portfolio tracking\n' +
      '✅ Practice with ₹1,00,000 virtual balance\n\n' +
      'Perfect for beginners and experienced traders! 📈'
    )
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg font-semibold text-blue-600">Loading Profile...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-6 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full items-center justify-center">
            <User size={32} color="white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {user?.display_name || user?.email?.split('@')[0] || 'Trader'}
            </Text>
            <Text className="text-gray-500">{user?.email}</Text>
            <View className="flex-row items-center mt-1">
              <Trophy size={16} color="#f59e0b" />
              <Text className="text-yellow-600 font-medium ml-1">Rank #{userStats.rank}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-blue-600">{userStats.totalTrades}</Text>
            <Text className="text-gray-500 text-sm">Total Trades</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className={`text-2xl font-bold ${
              userStats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{userStats.netPnL.toFixed(0)}
            </Text>
            <Text className="text-gray-500 text-sm">Net P&L</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-purple-600">{userStats.winRate.toFixed(1)}%</Text>
            <Text className="text-gray-500 text-sm">Win Rate</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Performance Stats */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Performance Analytics</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Total P&L</Text>
              <Text className={`text-lg font-bold ${
                userStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{userStats.totalPnL.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Total Brokerage Paid</Text>
              <Text className="text-lg font-bold text-red-600">₹{userStats.totalBrokerage.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Best Trade</Text>
              <Text className="text-lg font-bold text-green-600">₹{userStats.bestTrade.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Worst Trade</Text>
              <Text className="text-lg font-bold text-red-600">₹{userStats.worstTrade.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Leaderboard Points</Text>
              <Text className="text-lg font-bold text-yellow-600">{userStats.leaderboardPoints}</Text>
            </View>
          </View>
        </View>

        {/* Referral Program */}
        <TouchableOpacity className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Gift size={24} color="white" />
              <View className="ml-3">
                <Text className="text-white font-bold text-lg">Referral Program</Text>
                <Text className="text-white opacity-90">Invite friends and earn rewards</Text>
              </View>
            </View>
            <View className="bg-white bg-opacity-20 rounded-full p-2">
              <Text className="text-white font-bold">→</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Settings</Text>
          
          <View className="space-y-4">
            {/* Dark Mode */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                {settings.darkMode ? (
                  <Moon size={20} color="#6b7280" />
                ) : (
                  <Sun size={20} color="#6b7280" />
                )}
                <Text className="text-gray-700 ml-3">Dark Mode</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.darkMode ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Notifications */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Bell size={20} color="#6b7280" />
                <Text className="text-gray-700 ml-3">Push Notifications</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.notifications ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Sound */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Settings size={20} color="#6b7280" />
                <Text className="text-gray-700 ml-3">Sound Effects</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting('soundEnabled', value)}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Brokerage Simulation */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <DollarSign size={20} color="#6b7280" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-700">Brokerage Simulation</Text>
                  <Text className="text-xs text-gray-500">₹20 per trade for realistic experience</Text>
                </View>
              </View>
              <Switch
                value={settings.brokerageSimulation}
                onValueChange={(value) => updateSetting('brokerageSimulation', value)}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.brokerageSimulation ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Actions</Text>
          
          <TouchableOpacity
            onPress={shareApp}
            className="flex-row items-center py-3 border-b border-gray-100"
          >
            <Share2 size={20} color="#3b82f6" />
            <Text className="text-blue-600 font-medium ml-3">Share App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center py-3"
          >
            <LogOut size={20} color="#dc2626" />
            <Text className="text-red-600 font-medium ml-3">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">About PRO TRADE</Text>
          <Text className="text-gray-600 text-sm leading-5">
            PRO TRADE is a virtual stock trading platform designed to help you learn and practice trading 
            without any financial risk. All trades are simulated using real-time market data.
          </Text>
          <Text className="text-gray-500 text-xs mt-3">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}