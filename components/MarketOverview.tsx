import { View, Text, ScrollView } from 'react-native'
import { TrendingUp, TrendingDown } from 'lucide-react-native'
import { useMarketData } from '@/src/hooks/useMarketData'

export function MarketOverview() {
  const { stocks, loading, getIndices } = useMarketData()
  const indices = getIndices()

  if (loading) {
    return (
      <View className="px-4 mb-6">
        <Text className="text-lg font-sf-pro font-semibold text-text mb-4">
          Market Overview
        </Text>
        <View className="bg-card rounded-2xl p-6 shadow-sm">
          <Text className="text-center text-textSecondary font-sf-text">
            Loading market data...
          </Text>
        </View>
      </View>
    )
  }

  const renderMarketItem = (item: any) => {
    const isPositive = item.change >= 0
    const changePercent = ((item.change / (item.price - item.change)) * 100).toFixed(2)
    
    return (
      <View key={item.symbol} className="bg-card rounded-2xl p-4 mr-3 min-w-[160px] shadow-sm">
        <View className="mb-2">
          <Text className="text-sm font-sf-pro font-semibold text-text">
            {item.name}
          </Text>
          <Text className="text-xs text-textSecondary mt-1">
            {item.symbol}
          </Text>
        </View>
        
        <View className="items-start">
          <Text className="text-lg font-sf-pro font-bold text-text">
            ₹{item.price.toLocaleString('en-IN')}
          </Text>
          <View className="flex-row items-center mt-1">
            {isPositive ? (
              <TrendingUp color="#34C759" size={12} />
            ) : (
              <TrendingDown color="#FF3B30" size={12} />
            )}
            <Text className={`text-xs font-sf-text font-medium ml-1 ${
              isPositive ? 'text-accent' : 'text-danger'
            }`}>
              {isPositive ? '+' : ''}₹{Math.abs(item.change).toFixed(2)} ({changePercent}%)
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="mb-6">
      {/* Indices */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-sf-pro font-semibold text-text mb-4">
          Market Indices
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {indices.map(renderMarketItem)}
        </ScrollView>
      </View>

      {/* Top Stocks */}
      <View className="px-4">
        <Text className="text-lg font-sf-pro font-semibold text-text mb-4">
          Top Stocks
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {stocks.map(renderMarketItem)}
        </ScrollView>
      </View>
    </View>
  )
}