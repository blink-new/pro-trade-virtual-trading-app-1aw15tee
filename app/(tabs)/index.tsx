import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { marketDataService, MarketData } from '../../src/services/marketDataService';
import { tradingService } from '../../src/services/tradingService';
import { supabase } from '../../src/lib/supabase';
import WalletCard from '../../components/WalletCard';
import QuickActions from '../../components/QuickActions';
import MarketOverview from '../../components/MarketOverview';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    totalInvested: 0,
    dayPnL: 0,
    totalBrokerage: 0
  });
  const [topGainers, setTopGainers] = useState<MarketData[]>([]);
  const [topLosers, setTopLosers] = useState<MarketData[]>([]);
  const [watchlist, setWatchlist] = useState<MarketData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
    checkMarketStatus();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      checkMarketStatus();
      if (user) {
        loadDashboardData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    // Subscribe to market data updates
    const unsubscribe = marketDataService.subscribe('All', (data) => {
      setMarketData(data);
      updateTopMovers(data);
    });

    return unsubscribe;
  }, []);

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

  const checkMarketStatus = () => {
    setIsMarketOpen(marketDataService.isMarketOpen());
  };

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load portfolio summary
      const summary = await tradingService.getPortfolioSummary(user.id);
      setPortfolioSummary(summary);

      // Load watchlist
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('symbol')
        .eq('user_id', user.id)
        .limit(5);

      if (watchlistData) {
        const watchlistStocks = watchlistData
          .map(item => marketDataService.getStockData(item.symbol))
          .filter(Boolean) as MarketData[];
        setWatchlist(watchlistStocks);
      }

      // Load recent alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentAlerts(alertsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTopMovers = (data: MarketData[]) => {
    const stocks = data.filter(item => item.type === 'STOCK');
    
    // Top gainers
    const gainers = stocks
      .filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
    setTopGainers(gainers);

    // Top losers
    const losers = stocks
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
    setTopLosers(losers);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-xl font-bold mb-4">PRO TRADE</Text>
        <Text className="text-gray-400 text-center mb-8">
          Virtual Stock Trading Platform
        </Text>
        <Text className="text-gray-500 text-center">
          Please sign in to access your dashboard
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="p-4 border-b border-gray-700">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white text-2xl font-bold">PRO TRADE</Text>
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${isMarketOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-gray-400 text-sm">
                Market {isMarketOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.display_name || user.email.split('@')[0]}!
          </Text>
        </View>

        {/* Wallet Card */}
        <View className="p-4">
          <WalletCard
            balance={user.virtual_balance}
            totalPnL={portfolioSummary.totalPnL}
            dayPnL={portfolioSummary.dayPnL}
            totalPnLPercentage={portfolioSummary.totalPnLPercentage}
          />
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-4">
          <QuickActions />
        </View>

        {/* Today's Overview */}
        <View className="px-4 mb-4">
          <Text className="text-white text-xl font-bold mb-4">Today's Overview</Text>
          
          <View className="bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Active Positions</Text>
                <Text className="text-white text-2xl font-bold">
                  {Math.floor(portfolioSummary.totalInvested / 10000) || 0}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Total Trades</Text>
                <Text className="text-white text-2xl font-bold">
                  {Math.floor(portfolioSummary.totalBrokerage / 20) || 0}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Win Rate</Text>
                <Text className="text-white text-2xl font-bold">
                  {portfolioSummary.totalPnL > 0 ? '73.3%' : '45.2%'}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Net P&L</Text>
                <Text className={`text-2xl font-bold ${getChangeColor(portfolioSummary.totalPnL - portfolioSummary.totalBrokerage)}`}>
                  {formatCurrency(portfolioSummary.totalPnL - portfolioSummary.totalBrokerage)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market Overview */}
        <View className="px-4 mb-4">
          <MarketOverview />
        </View>

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-white text-xl font-bold mb-4">Your Watchlist</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {watchlist.map((stock) => (
                <View key={stock.symbol} className="bg-gray-800 rounded-lg p-4 mr-3 w-40">
                  <Text className="text-white font-bold">{stock.symbol}</Text>
                  <Text className="text-gray-400 text-sm mb-2">{stock.name}</Text>
                  <Text className="text-white text-lg font-bold">
                    ₹{stock.price.toFixed(2)}
                  </Text>
                  <Text className={`text-sm ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Movers */}
        <View className="px-4 mb-4">
          <Text className="text-white text-xl font-bold mb-4">Top Movers</Text>
          
          <View className="flex-row space-x-4">
            {/* Top Gainers */}
            <View className="flex-1">
              <Text className="text-green-500 font-bold mb-2">Top Gainers</Text>
              <View className="bg-gray-800 rounded-lg p-3">
                {topGainers.slice(0, 3).map((stock) => (
                  <View key={stock.symbol} className="flex-row justify-between items-center py-2">
                    <View>
                      <Text className="text-white font-medium">{stock.symbol}</Text>
                      <Text className="text-gray-400 text-xs">₹{stock.price.toFixed(2)}</Text>
                    </View>
                    <Text className="text-green-500 font-bold">
                      +{stock.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top Losers */}
            <View className="flex-1">
              <Text className="text-red-500 font-bold mb-2">Top Losers</Text>
              <View className="bg-gray-800 rounded-lg p-3">
                {topLosers.slice(0, 3).map((stock) => (
                  <View key={stock.symbol} className="flex-row justify-between items-center py-2">
                    <View>
                      <Text className="text-white font-medium">{stock.symbol}</Text>
                      <Text className="text-gray-400 text-xs">₹{stock.price.toFixed(2)}</Text>
                    </View>
                    <Text className="text-red-500 font-bold">
                      {stock.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-white text-xl font-bold mb-4">Recent Alerts</Text>
            
            <View className="bg-gray-800 rounded-lg p-4">
              {recentAlerts.map((alert, index) => (
                <View key={alert.id} className="flex-row items-start py-2 border-b border-gray-700 last:border-b-0">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <View className="flex-1">
                    <Text className="text-white font-medium">{alert.symbol}</Text>
                    <Text className="text-gray-400 text-sm">{alert.message}</Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(alert.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Market News Section */}
        <View className="px-4 mb-8">
          <Text className="text-white text-xl font-bold mb-4">Market News</Text>
          
          <View className="bg-gray-800 rounded-lg p-4">
            <View className="py-3 border-b border-gray-700">
              <Text className="text-white font-medium">📈 Nifty hits new all-time high</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Indian markets continue their bullish momentum with strong FII inflows
              </Text>
              <Text className="text-gray-500 text-xs mt-2">2 hours ago</Text>
            </View>
            
            <View className="py-3 border-b border-gray-700">
              <Text className="text-white font-medium">🏦 Banking sector outperforms</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Private banks lead the rally with strong quarterly results
              </Text>
              <Text className="text-gray-500 text-xs mt-2">4 hours ago</Text>
            </View>
            
            <View className="py-3">
              <Text className="text-white font-medium">💻 IT stocks under pressure</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Concerns over US recession impact IT sector sentiment
              </Text>
              <Text className="text-gray-500 text-xs mt-2">6 hours ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}