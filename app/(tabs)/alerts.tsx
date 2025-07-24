import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import { Bell, TrendingUp, AlertTriangle, Target, Settings } from 'lucide-react-native'

interface MockAlert {
  id: string
  symbol: string
  type: string
  message: string
  isTriggered: boolean
  createdAt: string
}

export default function AlertsScreen() {
  const [alerts] = useState<MockAlert[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      type: 'PRICE_TARGET',
      message: 'RELIANCE reached your target price of ₹2450',
      isTriggered: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      symbol: 'NIFTY',
      type: 'MISSED_OPPORTUNITY',
      message: 'NIFTY CE moved from ₹45 to ₹67 (+48.9%)',
      isTriggered: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      symbol: 'TCS',
      type: 'HIGH_VOLATILITY',
      message: 'TCS showing high volatility - Consider reviewing position',
      isTriggered: false,
      createdAt: new Date(Date.now() - 10800000).toISOString()
    }
  ])

  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    priceAlerts: true,
    volatilityAlerts: true,
    missedOpportunities: true
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'PRICE_TARGET':
        return <Target size={20} color="#10b981" />
      case 'MISSED_OPPORTUNITY':
        return <TrendingUp size={20} color="#f59e0b" />
      case 'HIGH_VOLATILITY':
        return <AlertTriangle size={20} color="#ef4444" />
      default:
        return <Bell size={20} color="#6b7280" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'PRICE_TARGET':
        return 'border-green-200 bg-green-50'
      case 'MISSED_OPPORTUNITY':
        return 'border-yellow-200 bg-yellow-50'
      case 'HIGH_VOLATILITY':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const renderAlert = (alert: MockAlert) => (
    <View key={alert.id} className={`rounded-xl p-4 mb-3 border ${getAlertColor(alert.type)}`}>
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center">
          {getAlertIcon(alert.type)}
          <Text className="text-lg font-bold text-gray-900 ml-2">{alert.symbol}</Text>
          {alert.isTriggered && (
            <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
              <Text className="text-xs text-blue-600 font-medium">TRIGGERED</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-500">
          {new Date(alert.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      
      <Text className="text-gray-700 mb-2">{alert.message}</Text>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500 capitalize">
          {alert.type.replace('_', ' ').toLowerCase()}
        </Text>
        <Text className="text-xs text-gray-400">
          {new Date(alert.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Alerts</Text>
          <View className="flex-row items-center">
            <Bell size={20} color="#3b82f6" />
            <Text className="text-blue-600 font-medium ml-2">{alerts.length} Active</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between">
          <View className="flex-1 bg-green-50 rounded-lg p-3 mr-2">
            <Text className="text-xs text-green-600">Price Targets</Text>
            <Text className="text-lg font-bold text-green-700">
              {alerts.filter(a => a.type === 'PRICE_TARGET').length}
            </Text>
          </View>
          
          <View className="flex-1 bg-yellow-50 rounded-lg p-3 mx-1">
            <Text className="text-xs text-yellow-600">Opportunities</Text>
            <Text className="text-lg font-bold text-yellow-700">
              {alerts.filter(a => a.type === 'MISSED_OPPORTUNITY').length}
            </Text>
          </View>
          
          <View className="flex-1 bg-red-50 rounded-lg p-3 ml-2">
            <Text className="text-xs text-red-600">Volatility</Text>
            <Text className="text-lg font-bold text-red-700">
              {alerts.filter(a => a.type === 'HIGH_VOLATILITY').length}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Recent Alerts */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Recent Alerts</Text>
          
          {alerts.length > 0 ? (
            alerts.map(renderAlert)
          ) : (
            <View className="bg-white rounded-xl p-8 items-center shadow-sm">
              <Bell size={48} color="#9ca3af" />
              <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">No Alerts</Text>
              <Text className="text-gray-500 text-center">
                Set up price alerts and notifications to stay informed
              </Text>
            </View>
          )}
        </View>

        {/* Alert Settings */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Settings size={24} color="#3b82f6" />
            <Text className="text-lg font-bold text-gray-900 ml-2">Alert Settings</Text>
          </View>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">Push Notifications</Text>
                <Text className="text-gray-500 text-sm">Receive alerts on your device</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.notifications ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">Sound Alerts</Text>
                <Text className="text-gray-500 text-sm">Play sound for important alerts</Text>
              </View>
              <Switch
                value={settings.sound}
                onValueChange={(value) => setSettings(prev => ({ ...prev, sound: value }))}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.sound ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">Price Target Alerts</Text>
                <Text className="text-gray-500 text-sm">Alert when stocks reach target prices</Text>
              </View>
              <Switch
                value={settings.priceAlerts}
                onValueChange={(value) => setSettings(prev => ({ ...prev, priceAlerts: value }))}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.priceAlerts ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">Volatility Alerts</Text>
                <Text className="text-gray-500 text-sm">Alert on high volatility movements</Text>
              </View>
              <Switch
                value={settings.volatilityAlerts}
                onValueChange={(value) => setSettings(prev => ({ ...prev, volatilityAlerts: value }))}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.volatilityAlerts ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-900 font-medium">Missed Opportunities</Text>
                <Text className="text-gray-500 text-sm">Alert on potential missed trades</Text>
              </View>
              <Switch
                value={settings.missedOpportunities}
                onValueChange={(value) => setSettings(prev => ({ ...prev, missedOpportunities: value }))}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={settings.missedOpportunities ? '#ffffff' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Alert Types Info */}
        <View className="bg-white rounded-xl p-4 mt-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-3">Alert Types</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Target size={16} color="#10b981" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">Price Target</Text>
                <Text className="text-gray-500 text-sm">
                  Alerts when your watchlist stocks reach specific price levels
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <TrendingUp size={16} color="#f59e0b" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">Missed Opportunity</Text>
                <Text className="text-gray-500 text-sm">
                  Notifications about significant price movements you might have missed
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <AlertTriangle size={16} color="#ef4444" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-medium">High Volatility</Text>
                <Text className="text-gray-500 text-sm">
                  Alerts during periods of unusual market volatility
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}