import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { tradingService, Position } from '../../src/services/tradingService';
import { supabase } from '../../src/lib/supabase';

export default function PortfolioScreen() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    totalInvested: 0,
    dayPnL: 0,
    totalBrokerage: 0
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadPortfolioData();
      // Set up real-time updates
      const interval = setInterval(loadPortfolioData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadPortfolioData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load positions
      const positionsData = await tradingService.getPositions(user.id);
      setPositions(positionsData);

      // Load portfolio summary
      const summary = await tradingService.getPortfolioSummary(user.id);
      setPortfolioSummary(summary);

      // Load trade history
      const history = await tradingService.getTradeHistory(user.id, 20);
      setTradeHistory(history);

    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  const handleSquareOff = async (positionId: string, symbol: string) => {
    Alert.alert(
      'Square Off Position',
      `Are you sure you want to square off your ${symbol} position?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Square Off',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await tradingService.squareOffPosition(user.id, positionId);
              if (result.success) {
                Alert.alert('Success', result.message);
                loadPortfolioData();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to square off position');
            }
          }
        }
      ]
    );
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading && positions.length === 0) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">Loading portfolio...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="p-4 border-b border-gray-700">
        <Text className="text-white text-2xl font-bold mb-4">Portfolio</Text>
        
        {/* Portfolio Summary */}
        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400">Total Portfolio Value</Text>
            <Text className="text-white text-2xl font-bold">
              {formatCurrency(portfolioSummary.totalValue)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Total P&L</Text>
            <View className="items-end">
              <Text className={`text-lg font-bold ${getChangeColor(portfolioSummary.totalPnL)}`}>
                {portfolioSummary.totalPnL > 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalPnL)}
              </Text>
              <Text className={`text-sm ${getChangeColor(portfolioSummary.totalPnLPercentage)}`}>
                ({formatPercentage(portfolioSummary.totalPnLPercentage)})
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Net P&L (After Brokerage)</Text>
            <Text className={`font-bold ${getChangeColor(portfolioSummary.totalPnL - portfolioSummary.totalBrokerage)}`}>
              {formatCurrency(portfolioSummary.totalPnL - portfolioSummary.totalBrokerage)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Total Invested</Text>
            <Text className="text-white">{formatCurrency(portfolioSummary.totalInvested)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Day P&L</Text>
            <Text className={`font-bold ${getChangeColor(portfolioSummary.dayPnL)}`}>
              {portfolioSummary.dayPnL > 0 ? '+' : ''}{formatCurrency(portfolioSummary.dayPnL)}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-400">Total Brokerage Paid</Text>
            <Text className="text-red-400">{formatCurrency(portfolioSummary.totalBrokerage)}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-gray-800 mx-4 rounded-lg p-1 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab('positions')}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === 'positions' ? 'bg-blue-600' : 'bg-transparent'
          }`}
        >
          <Text className="text-white text-center font-medium">
            Positions ({positions.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === 'history' ? 'bg-blue-600' : 'bg-transparent'
          }`}
        >
          <Text className="text-white text-center font-medium">
            Trade History ({tradeHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'positions' ? (
          // Positions Tab
          <View className="px-4">
            {positions.length === 0 ? (
              <View className="bg-gray-800 rounded-lg p-8 items-center">
                <Text className="text-gray-400 text-lg mb-2">No Open Positions</Text>
                <Text className="text-gray-500 text-center">
                  Start trading to see your positions here
                </Text>
              </View>
            ) : (
              positions.map((position) => (
                <View key={position.id} className="bg-gray-800 rounded-lg p-4 mb-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-white font-bold text-lg">{position.symbol}</Text>
                      <Text className="text-gray-400">
                        {position.quantity} shares • Avg: {formatCurrency(position.avgPrice)}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-white font-bold text-lg">
                        {formatCurrency(position.currentPrice)}
                      </Text>
                      <Text className={`text-sm ${getChangeColor(position.pnl)}`}>
                        {position.pnl > 0 ? '+' : ''}{formatCurrency(position.pnl)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <View>
                      <Text className="text-gray-400 text-sm">Invested</Text>
                      <Text className="text-white font-medium">
                        {formatCurrency(position.investedAmount)}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-gray-400 text-sm">Current Value</Text>
                      <Text className="text-white font-medium">
                        {formatCurrency(position.currentValue)}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-gray-400 text-sm">P&L %</Text>
                      <Text className={`font-bold ${getChangeColor(position.pnlPercentage)}`}>
                        {formatPercentage(position.pnlPercentage)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSquareOff(position.id, position.symbol)}
                    className="bg-red-600 py-2 rounded-lg"
                  >
                    <Text className="text-white font-bold text-center">Square Off</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          // Trade History Tab
          <View className="px-4">
            {tradeHistory.length === 0 ? (
              <View className="bg-gray-800 rounded-lg p-8 items-center">
                <Text className="text-gray-400 text-lg mb-2">No Trade History</Text>
                <Text className="text-gray-500 text-center">
                  Your completed trades will appear here
                </Text>
              </View>
            ) : (
              tradeHistory.map((trade, index) => (
                <View key={trade.id || index} className="bg-gray-800 rounded-lg p-4 mb-3">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-white font-bold">{trade.symbol}</Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(trade.created_at).toLocaleDateString()} • {new Date(trade.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <View className={`px-2 py-1 rounded ${
                        trade.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        <Text className="text-white font-bold text-xs">{trade.type}</Text>
                      </View>
                      <Text className={`text-sm mt-1 ${
                        trade.status === 'CLOSED' ? 'text-gray-400' : 'text-yellow-500'
                      }`}>
                        {trade.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between text-sm">
                    <View>
                      <Text className="text-gray-400">Quantity</Text>
                      <Text className="text-white">{trade.quantity}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-gray-400">Price</Text>
                      <Text className="text-white">{formatCurrency(trade.price)}</Text>
                    </View>
                    
                    <View>
                      <Text className="text-gray-400">Brokerage</Text>
                      <Text className="text-red-400">{formatCurrency(trade.brokerage || 0)}</Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-gray-400">Total</Text>
                      <Text className="text-white font-medium">
                        {formatCurrency(trade.total_amount)}
                      </Text>
                    </View>
                  </View>

                  {trade.pnl !== undefined && trade.pnl !== 0 && (
                    <View className="mt-2 pt-2 border-t border-gray-700">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-400">P&L</Text>
                        <Text className={`font-bold ${getChangeColor(trade.pnl)}`}>
                          {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}