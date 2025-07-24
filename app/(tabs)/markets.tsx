import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { marketDataService, MarketData, OptionChainData } from '../../src/services/marketDataService';
import { tradingService } from '../../src/services/tradingService';
import { supabase } from '../../src/lib/supabase';
import FundamentalStatsViewer from '../../components/FundamentalStatsViewer';
import AdvancedChart from '../../components/AdvancedChart';

const sectors = ['All', 'INDEX', 'Nifty50', 'BankNifty', 'Auto', 'Pharma', 'FMCG', 'IT'];

export default function MarketsScreen() {
  const [selectedSector, setSelectedSector] = useState('All');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MarketData | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showOptionChain, setShowOptionChain] = useState(false);
  const [optionChainData, setOptionChainData] = useState<OptionChainData[]>([]);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState('1');
  const [user, setUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    loadUser();
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = marketDataService.subscribe(selectedSector, (data) => {
      setMarketData(data);
    });

    return unsubscribe;
  }, [selectedSector]);

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
        setUserBalance(userData?.virtual_balance || 0);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const checkMarketStatus = () => {
    setIsMarketOpen(marketDataService.isMarketOpen());
  };

  const filteredData = marketData.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockPress = (stock: MarketData) => {
    setSelectedStock(stock);
  };

  const handleShowChart = (stock: MarketData) => {
    setSelectedStock(stock);
    setShowChart(true);
  };

  const handleShowOptionChain = (stock: MarketData) => {
    setSelectedStock(stock);
    const optionData = marketDataService.getOptionChain(stock.symbol);
    setOptionChainData(optionData);
    setShowOptionChain(true);
  };

  const handleTrade = (stock: MarketData, type: 'BUY' | 'SELL') => {
    if (!isMarketOpen) {
      Alert.alert('Market Closed', 'Trading is not allowed outside market hours (9:15 AM - 3:30 PM)');
      return;
    }

    setSelectedStock(stock);
    setTradeType(type);
    setShowTradeModal(true);
  };

  const executeTrade = async () => {
    if (!selectedStock || !user) return;

    const quantity = parseInt(tradeQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    try {
      const settings = await tradingService.getUserSettings(user.id);
      const result = await tradingService.executeTrade({
        symbol: selectedStock.symbol,
        type: tradeType,
        quantity,
        price: selectedStock.price,
        userId: user.id
      }, settings.brokerageSimulation);

      if (result.success) {
        Alert.alert('Trade Executed', result.message);
        setUserBalance(result.newBalance || userBalance);
        setShowTradeModal(false);
        setTradeQuantity('1');
      } else {
        Alert.alert('Trade Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to execute trade');
    }
  };

  const addToWatchlist = async (symbol: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      Alert.alert('Success', 'Added to watchlist');
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist');
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="p-4 border-b border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">Markets</Text>
          <View className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-2 ${isMarketOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-gray-400">
              Market {isMarketOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search stocks, indices..."
          placeholderTextColor="#6B7280"
          className="bg-gray-800 text-white p-3 rounded-lg"
        />
      </View>

      {/* Sector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="p-4"
      >
        {sectors.map((sector) => (
          <TouchableOpacity
            key={sector}
            onPress={() => setSelectedSector(sector)}
            className={`px-4 py-2 rounded-lg mr-2 ${
              selectedSector === sector ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white font-medium">{sector}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Market Data */}
      <ScrollView className="flex-1">
        {filteredData.map((stock) => (
          <View key={stock.symbol}>
            {/* Stock Card */}
            <TouchableOpacity
              onPress={() => handleStockPress(stock)}
              className="bg-gray-800 mx-4 mb-2 p-4 rounded-lg"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{stock.symbol}</Text>
                  <Text className="text-gray-400 text-sm">{stock.name}</Text>
                  <Text className="text-gray-500 text-xs">{stock.sector}</Text>
                </View>
                
                <View className="items-end">
                  <Text className="text-white font-bold text-xl">
                    ₹{stock.price.toFixed(2)}
                  </Text>
                  <Text className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-700">
                <TouchableOpacity
                  onPress={() => handleTrade(stock, 'BUY')}
                  className="bg-green-600 px-4 py-2 rounded-lg flex-1 mr-1"
                  disabled={!isMarketOpen}
                >
                  <Text className="text-white font-bold text-center">BUY</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleTrade(stock, 'SELL')}
                  className="bg-red-600 px-4 py-2 rounded-lg flex-1 mx-1"
                  disabled={!isMarketOpen}
                >
                  <Text className="text-white font-bold text-center">SELL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleShowChart(stock)}
                  className="bg-blue-600 px-4 py-2 rounded-lg flex-1 mx-1"
                >
                  <Text className="text-white font-bold text-center">CHART</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => addToWatchlist(stock.symbol)}
                  className="bg-gray-600 px-4 py-2 rounded-lg flex-1 ml-1"
                >
                  <Text className="text-white font-bold text-center">+</Text>
                </TouchableOpacity>
              </View>

              {/* Option Chain Button for Indices */}
              {stock.type === 'INDEX' && (
                <TouchableOpacity
                  onPress={() => handleShowOptionChain(stock)}
                  className="bg-purple-600 p-2 rounded-lg mt-2"
                >
                  <Text className="text-white font-bold text-center">View Option Chain</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Fundamental Stats */}
            {selectedStock?.symbol === stock.symbol && (
              <View className="mx-4 mb-4">
                <FundamentalStatsViewer
                  symbol={stock.symbol}
                  marketData={stock}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Chart Modal */}
      <Modal
        visible={showChart}
        animationType="slide"
        onRequestClose={() => setShowChart(false)}
      >
        {selectedStock && (
          <AdvancedChart
            symbol={selectedStock.symbol}
            onClose={() => setShowChart(false)}
          />
        )}
      </Modal>

      {/* Option Chain Modal */}
      <Modal
        visible={showOptionChain}
        animationType="slide"
        onRequestClose={() => setShowOptionChain(false)}
      >
        <View className="flex-1 bg-gray-900">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <Text className="text-white text-xl font-bold">
              {selectedStock?.symbol} Option Chain
            </Text>
            <TouchableOpacity
              onPress={() => setShowOptionChain(false)}
              className="bg-gray-700 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {/* Option Chain Header */}
            <View className="bg-gray-800 p-4 flex-row">
              <Text className="text-white font-bold flex-1 text-center">CALL</Text>
              <Text className="text-white font-bold w-20 text-center">STRIKE</Text>
              <Text className="text-white font-bold flex-1 text-center">PUT</Text>
            </View>

            {optionChainData.map((option, index) => (
              <View key={index} className="bg-gray-800 border-b border-gray-700 p-2 flex-row">
                {/* Call Side */}
                <View className="flex-1 pr-2">
                  <Text className="text-green-500 font-bold">₹{option.callLTP.toFixed(2)}</Text>
                  <Text className="text-gray-400 text-xs">OI: {option.callOI.toLocaleString()}</Text>
                  <Text className="text-gray-400 text-xs">Vol: {option.callVolume.toLocaleString()}</Text>
                </View>

                {/* Strike Price */}
                <View className="w-20 items-center justify-center">
                  <Text className="text-white font-bold">{option.strikePrice}</Text>
                </View>

                {/* Put Side */}
                <View className="flex-1 pl-2">
                  <Text className="text-red-500 font-bold">₹{option.putLTP.toFixed(2)}</Text>
                  <Text className="text-gray-400 text-xs">OI: {option.putOI.toLocaleString()}</Text>
                  <Text className="text-gray-400 text-xs">Vol: {option.putVolume.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Trade Modal */}
      <Modal
        visible={showTradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-gray-800 rounded-lg p-6 w-80">
            <Text className="text-white text-xl font-bold mb-4">
              {tradeType} {selectedStock?.symbol}
            </Text>

            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Current Price</Text>
              <Text className="text-white text-2xl font-bold">
                ₹{selectedStock?.price.toFixed(2)}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Quantity</Text>
              <TextInput
                value={tradeQuantity}
                onChangeText={setTradeQuantity}
                keyboardType="numeric"
                className="bg-gray-700 text-white p-3 rounded-lg"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Total Amount</Text>
              <Text className="text-white text-lg">
                ₹{((selectedStock?.price || 0) * parseInt(tradeQuantity || '0')).toFixed(2)}
              </Text>
              <Text className="text-gray-400 text-sm">+ ₹20 brokerage</Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Available Balance</Text>
              <Text className="text-white text-lg">₹{userBalance.toFixed(2)}</Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowTradeModal(false)}
                className="bg-gray-600 px-6 py-3 rounded-lg flex-1"
              >
                <Text className="text-white font-bold text-center">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={executeTrade}
                className={`px-6 py-3 rounded-lg flex-1 ${
                  tradeType === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                <Text className="text-white font-bold text-center">{tradeType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}