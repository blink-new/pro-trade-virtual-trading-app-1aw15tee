import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MarketData, TechnicalIndicators, marketDataService } from '../src/services/marketDataService';

interface FundamentalStatsViewerProps {
  symbol: string;
  marketData: MarketData;
}

export default function FundamentalStatsViewer({ symbol, marketData }: FundamentalStatsViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadTechnicalData();
  }, [symbol]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const loadTechnicalData = async () => {
    try {
      const indicators = marketDataService.calculateTechnicalIndicators(symbol);
      setTechnicalData(indicators);
    } catch (error) {
      console.error('Error loading technical data:', error);
    }
  };

  const formatNumber = (num: number | undefined, suffix: string = '') => {
    if (!num) return 'N/A';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr${suffix}`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L${suffix}`;
    return `₹${num.toFixed(2)}${suffix}`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getRSILevel = (rsi: number) => {
    if (rsi > 70) return { level: 'Overbought', color: 'text-red-500' };
    if (rsi < 30) return { level: 'Oversold', color: 'text-green-500' };
    return { level: 'Neutral', color: 'text-yellow-500' };
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <View className="bg-gray-800 rounded-lg p-4 mb-4">
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View>
          <Text className="text-white font-bold text-lg">{symbol}</Text>
          <Text className="text-gray-400 text-sm">{marketData.name}</Text>
        </View>
        <View className="items-end">
          <Text className="text-white font-bold text-xl">
            ₹{marketData.price.toFixed(2)}
          </Text>
          <Text className={`text-sm font-medium ${getPerformanceColor(marketData.change)}`}>
            {marketData.change > 0 ? '+' : ''}₹{marketData.change.toFixed(2)} ({marketData.changePercent.toFixed(2)}%)
          </Text>
        </View>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-700">
        <View className="items-center">
          <Text className="text-gray-400 text-xs">Volume</Text>
          <Text className="text-white font-medium">
            {(marketData.volume / 100000).toFixed(1)}L
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-400 text-xs">Market Cap</Text>
          <Text className="text-white font-medium">
            {formatNumber(marketData.marketCap)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-400 text-xs">P/E Ratio</Text>
          <Text className="text-white font-medium">
            {marketData.pe?.toFixed(2) || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text className="text-blue-500 font-medium">
            {isExpanded ? 'Less' : 'More'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Content */}
      <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Fundamental Data */}
          <View className="mt-4">
            <Text className="text-white font-bold text-lg mb-3">Fundamental Analysis</Text>
            
            <View className="bg-gray-900 rounded-lg p-4 mb-4">
              <Text className="text-gray-400 font-medium mb-3">Key Metrics</Text>
              
              <View className="flex-row justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">Market Cap</Text>
                  <Text className="text-white font-medium">
                    {formatNumber(marketData.marketCap)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">P/E Ratio</Text>
                  <Text className="text-white font-medium">
                    {marketData.pe?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">EPS</Text>
                  <Text className="text-white font-medium">
                    ₹{marketData.eps?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">Sector</Text>
                  <Text className="text-white font-medium">{marketData.sector}</Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">52W High</Text>
                  <Text className="text-white font-medium">
                    ₹{marketData.high52w?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">52W Low</Text>
                  <Text className="text-white font-medium">
                    ₹{marketData.low52w?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Technical Analysis */}
            {technicalData && (
              <View className="bg-gray-900 rounded-lg p-4 mb-4">
                <Text className="text-gray-400 font-medium mb-3">Technical Analysis</Text>
                
                {/* RSI */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-medium">RSI (14)</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white mr-2">{technicalData.rsi.toFixed(2)}</Text>
                      <Text className={`font-bold ${getRSILevel(technicalData.rsi).color}`}>
                        {getRSILevel(technicalData.rsi).level}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-gray-700 h-2 rounded-full">
                    <View
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${technicalData.rsi}%` }}
                    />
                  </View>
                </View>

                {/* MACD */}
                <View className="mb-4">
                  <Text className="text-white font-medium mb-2">MACD</Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-400 text-xs">MACD</Text>
                      <Text className={`font-medium ${getPerformanceColor(technicalData.macd.macd)}`}>
                        {technicalData.macd.macd.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">Signal</Text>
                      <Text className={`font-medium ${getPerformanceColor(technicalData.macd.signal)}`}>
                        {technicalData.macd.signal.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">Histogram</Text>
                      <Text className={`font-medium ${getPerformanceColor(technicalData.macd.histogram)}`}>
                        {technicalData.macd.histogram.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Moving Averages */}
                <View className="mb-4">
                  <Text className="text-white font-medium mb-2">Moving Averages</Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-400 text-xs">SMA 20</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.sma20.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">SMA 50</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.sma50.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">EMA 20</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.ema20.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bollinger Bands */}
                <View>
                  <Text className="text-white font-medium mb-2">Bollinger Bands</Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-400 text-xs">Upper</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.bollinger.upper.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">Middle</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.bollinger.middle.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">Lower</Text>
                      <Text className="text-white font-medium">
                        ₹{technicalData.bollinger.lower.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Price Range Indicator */}
            <View className="bg-gray-900 rounded-lg p-4">
              <Text className="text-gray-400 font-medium mb-3">Price Range Analysis</Text>
              
              {marketData.high52w && marketData.low52w && (
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-sm">52W Low</Text>
                    <Text className="text-gray-400 text-sm">Current</Text>
                    <Text className="text-gray-400 text-sm">52W High</Text>
                  </View>
                  
                  <View className="bg-gray-700 h-3 rounded-full mb-2">
                    <View
                      className="h-3 rounded-full bg-gradient-to-r from-red-500 to-green-500"
                      style={{
                        width: `${((marketData.price - marketData.low52w) / (marketData.high52w - marketData.low52w)) * 100}%`
                      }}
                    />
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-white text-sm">₹{marketData.low52w.toFixed(2)}</Text>
                    <Text className="text-white font-bold">₹{marketData.price.toFixed(2)}</Text>
                    <Text className="text-white text-sm">₹{marketData.high52w.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}