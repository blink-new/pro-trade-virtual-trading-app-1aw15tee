import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { marketDataService, CandleData, TechnicalIndicators } from '../src/services/marketDataService';

interface AdvancedChartProps {
  symbol: string;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function AdvancedChart({ symbol, onClose }: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [showIndicators, setShowIndicators] = useState(false);

  const timeframes = [
    { label: '1M', value: '1M' },
    { label: '5M', value: '5M' },
    { label: '1H', value: '1H' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' }
  ];

  useEffect(() => {
    if (chartContainerRef.current) {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: screenWidth - 32,
        height: 400,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#485c7b',
        },
        timeScale: {
          borderColor: '#485c7b',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      candlestickSeriesRef.current = candlestickSeries;

      // Load data
      loadChartData();
      loadTechnicalIndicators();

      return () => {
        chart.remove();
      };
    }
  }, [symbol]);

  useEffect(() => {
    loadChartData();
  }, [timeframe]);

  const loadChartData = () => {
    const candleData = marketDataService.getCandlestickData(symbol, timeframe);
    if (candlestickSeriesRef.current && candleData.length > 0) {
      const formattedData = candleData.map(candle => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
      candlestickSeriesRef.current.setData(formattedData);
    }
  };

  const loadTechnicalIndicators = () => {
    try {
      const techIndicators = marketDataService.calculateTechnicalIndicators(symbol);
      setIndicators(techIndicators);
    } catch (error) {
      console.error('Error loading technical indicators:', error);
    }
  };

  const addMovingAverage = () => {
    if (!chartRef.current || !indicators) return;

    const lineSeries = chartRef.current.addLineSeries({
      color: '#2196F3',
      lineWidth: 2,
    });

    // Mock SMA data
    const candleData = marketDataService.getCandlestickData(symbol, timeframe);
    const smaData = candleData.map(candle => ({
      time: candle.time,
      value: indicators.sma20,
    }));

    lineSeries.setData(smaData);
  };

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { signal: 'SELL', color: '#ef5350' };
    if (rsi < 30) return { signal: 'BUY', color: '#26a69a' };
    return { signal: 'NEUTRAL', color: '#ffa726' };
  };

  const getMACDSignal = (macd: any) => {
    if (macd.macd > macd.signal) return { signal: 'BUY', color: '#26a69a' };
    return { signal: 'SELL', color: '#ef5350' };
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
        <View>
          <Text className="text-white text-lg font-bold">{symbol}</Text>
          <Text className="text-gray-400 text-sm">Live Chart</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="bg-gray-700 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Close</Text>
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="p-4"
      >
        {timeframes.map((tf) => (
          <TouchableOpacity
            key={tf.value}
            onPress={() => setTimeframe(tf.value)}
            className={`px-4 py-2 rounded-lg mr-2 ${
              timeframe === tf.value ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white font-medium">{tf.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart Container */}
      <View className="flex-1 px-4">
        <div
          ref={chartContainerRef}
          style={{
            width: screenWidth - 32,
            height: 400,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </View>

      {/* Technical Indicators */}
      <View className="p-4">
        <TouchableOpacity
          onPress={() => setShowIndicators(!showIndicators)}
          className="bg-gray-700 p-3 rounded-lg mb-4"
        >
          <Text className="text-white font-medium text-center">
            {showIndicators ? 'Hide' : 'Show'} Technical Indicators
          </Text>
        </TouchableOpacity>

        {showIndicators && indicators && (
          <View className="space-y-4">
            {/* RSI */}
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-white font-bold mb-2">RSI (14)</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-lg">{indicators.rsi.toFixed(2)}</Text>
                <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: getRSISignal(indicators.rsi).color }}>
                  <Text className="text-white font-bold text-xs">
                    {getRSISignal(indicators.rsi).signal}
                  </Text>
                </View>
              </View>
              <View className="mt-2 bg-gray-700 h-2 rounded-full">
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${indicators.rsi}%`,
                    backgroundColor: getRSISignal(indicators.rsi).color,
                  }}
                />
              </View>
            </View>

            {/* MACD */}
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-white font-bold mb-2">MACD</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-400 text-xs">MACD</Text>
                  <Text className="text-white">{indicators.macd.macd.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">Signal</Text>
                  <Text className="text-white">{indicators.macd.signal.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">Histogram</Text>
                  <Text className="text-white">{indicators.macd.histogram.toFixed(2)}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: getMACDSignal(indicators.macd).color }}>
                  <Text className="text-white font-bold text-xs">
                    {getMACDSignal(indicators.macd).signal}
                  </Text>
                </View>
              </View>
            </View>

            {/* Moving Averages */}
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-white font-bold mb-2">Moving Averages</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-400 text-xs">SMA 20</Text>
                  <Text className="text-white">₹{indicators.sma20.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">SMA 50</Text>
                  <Text className="text-white">₹{indicators.sma50.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">EMA 20</Text>
                  <Text className="text-white">₹{indicators.ema20.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Bollinger Bands */}
            <View className="bg-gray-800 p-4 rounded-lg">
              <Text className="text-white font-bold mb-2">Bollinger Bands</Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-400 text-xs">Upper</Text>
                  <Text className="text-white">₹{indicators.bollinger.upper.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">Middle</Text>
                  <Text className="text-white">₹{indicators.bollinger.middle.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">Lower</Text>
                  <Text className="text-white">₹{indicators.bollinger.lower.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Add Indicators Button */}
            <TouchableOpacity
              onPress={addMovingAverage}
              className="bg-blue-600 p-3 rounded-lg"
            >
              <Text className="text-white font-medium text-center">
                Add SMA 20 to Chart
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}