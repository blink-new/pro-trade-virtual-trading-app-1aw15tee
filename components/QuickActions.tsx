import { View, Text, TouchableOpacity } from 'react-native'
import { ShoppingCart, Minus, Eye, BarChart3 } from 'lucide-react-native'

export function QuickActions() {
  const actions = [
    {
      id: 'buy',
      title: 'Buy',
      subtitle: 'Place order',
      icon: ShoppingCart,
      color: '#34C759',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'sell',
      title: 'Sell',
      subtitle: 'Square off',
      icon: Minus,
      color: '#FF3B30',
      bgColor: 'bg-danger/10'
    },
    {
      id: 'watchlist',
      title: 'Watchlist',
      subtitle: 'Track stocks',
      icon: Eye,
      color: '#007AFF',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'analysis',
      title: 'Analysis',
      subtitle: 'View charts',
      icon: BarChart3,
      color: '#AF52DE',
      bgColor: 'bg-purple/10'
    }
  ]

  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-sf-pro font-semibold text-text mb-4">
        Quick Actions
      </Text>
      
      <View className="flex-row justify-between">
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            className={`${action.bgColor} rounded-2xl p-4 flex-1 mx-1 items-center`}
            activeOpacity={0.7}
          >
            <View className="mb-3">
              <action.icon color={action.color} size={24} />
            </View>
            <Text className="text-sm font-sf-pro font-semibold text-text text-center">
              {action.title}
            </Text>
            <Text className="text-xs text-textSecondary text-center mt-1">
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}