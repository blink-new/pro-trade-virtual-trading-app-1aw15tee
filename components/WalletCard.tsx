import { View, Text } from 'react-native'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react-native'

interface WalletCardProps {
  balance: number
  totalPnL: number
  todayPnL: number
}

export function WalletCard({ balance, totalPnL, todayPnL }: WalletCardProps) {
  const isProfitTotal = totalPnL >= 0
  const isProfitToday = todayPnL >= 0

  return (
    <View className="mx-4 mb-6">
      <View className="bg-primary rounded-2xl p-6 shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white/80 text-sm font-sf-text">Virtual Balance</Text>
            <Text className="text-white text-2xl font-sf-pro font-bold">
              ₹{balance.toLocaleString('en-IN')}
            </Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <Wallet color="#FFFFFF" size={24} />
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-white/80 text-xs font-sf-text">Total P&L</Text>
            <View className="flex-row items-center mt-1">
              {isProfitTotal ? (
                <TrendingUp color="#34C759" size={16} />
              ) : (
                <TrendingDown color="#FF3B30" size={16} />
              )}
              <Text className={`text-sm font-sf-pro font-semibold ml-1 ${
                isProfitTotal ? 'text-accent' : 'text-danger'
              }`}>
                {isProfitTotal ? '+' : ''}₹{totalPnL.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white/80 text-xs font-sf-text">Today's P&L</Text>
            <View className="flex-row items-center mt-1">
              {isProfitToday ? (
                <TrendingUp color="#34C759" size={16} />
              ) : (
                <TrendingDown color="#FF3B30" size={16} />
              )}
              <Text className={`text-sm font-sf-pro font-semibold ml-1 ${
                isProfitToday ? 'text-accent' : 'text-danger'
              }`}>
                {isProfitToday ? '+' : ''}₹{todayPnL.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}