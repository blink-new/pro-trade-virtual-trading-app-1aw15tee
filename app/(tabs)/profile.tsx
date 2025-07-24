import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { tradingService } from '../../src/services/tradingService';
import ReferralRewardSystem from '../../components/ReferralRewardSystem';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    bestTrade: 0,
    worstTrade: 0,
    totalBrokerage: 0,
    rank: 0
  });
  const [settings, setSettings] = useState({
    darkMode: true,
    notificationsEnabled: true,
    brokerageSimulation: true
  });
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // Get user settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (settingsData) {
        setSettings({
          darkMode: settingsData.dark_mode,
          notificationsEnabled: settingsData.notifications_enabled,
          brokerageSimulation: settingsData.brokerage_simulation
        });
      }

      // Load user statistics
      await loadUserStats(authUser.id);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Get trade statistics
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId);

      const { data: positions } = await supabase
        .from('positions')
        .select('pnl')
        .eq('user_id', userId);

      if (trades) {
        const totalTrades = trades.length;
        const closedTrades = trades.filter(t => t.status === 'CLOSED');
        const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
        
        const totalPnL = [...closedTrades, ...(positions || [])].reduce((sum, item) => sum + (item.pnl || 0), 0);
        const totalBrokerage = trades.reduce((sum, trade) => sum + (trade.brokerage || 0), 0);
        
        const pnlValues = [...closedTrades, ...(positions || [])].map(item => item.pnl || 0).filter(pnl => pnl !== 0);
        const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
        const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

        // Get user rank (mock calculation)
        const { data: allUsers } = await supabase
          .from('users')
          .select('total_pnl')
          .order('total_pnl', { ascending: false });

        const rank = allUsers ? allUsers.findIndex(u => u.total_pnl <= totalPnL) + 1 : 1;

        setUserStats({
          totalTrades,
          winRate,
          totalPnL,
          bestTrade,
          worstTrade,
          totalBrokerage,
          rank
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));

      if (!user) return;

      // Update in database
      const updateData: any = {};
      if (key === 'darkMode') updateData.dark_mode = value;
      if (key === 'notificationsEnabled') updateData.notifications_enabled = value;
      if (key === 'brokerageSimulation') updateData.brokerage_simulation = value;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      if (key === 'brokerageSimulation') {
        Alert.alert(
          'Setting Updated',
          value 
            ? 'Brokerage simulation is now enabled. ₹20 will be charged per trade.'
            : 'Brokerage simulation is now disabled. No charges per trade.'
        );
      }

    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">Please login to view profile</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-700">
          <Text className="text-white text-2xl font-bold mb-4">Profile</Text>
          
          {/* User Info */}
          <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-2xl font-bold">
                  {user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-white text-xl font-bold">
                {user.display_name || 'Trader'}
              </Text>
              <Text className="text-gray-400">{user.email}</Text>
              <Text className="text-blue-400 font-medium">Rank #{userStats.rank}</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-gray-400 text-sm">Virtual Balance</Text>
                <Text className="text-white text-lg font-bold">
                  {formatCurrency(user.virtual_balance)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-400 text-sm">Total P&L</Text>
                <Text className={`text-lg font-bold ${getPerformanceColor(userStats.totalPnL)}`}>
                  {userStats.totalPnL > 0 ? '+' : ''}{formatCurrency(userStats.totalPnL)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Analytics */}
        <View className="p-4">
          <Text className="text-white text-xl font-bold mb-4">Performance Analytics</Text>
          
          <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Total Trades</Text>
                <Text className="text-white text-2xl font-bold">{userStats.totalTrades}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Win Rate</Text>
                <Text className="text-white text-2xl font-bold">{userStats.winRate.toFixed(1)}%</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Best Trade</Text>
                <Text className="text-green-500 text-lg font-bold">
                  +{formatCurrency(userStats.bestTrade)}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Worst Trade</Text>
                <Text className="text-red-500 text-lg font-bold">
                  {formatCurrency(userStats.worstTrade)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Net P&L</Text>
                <Text className={`text-lg font-bold ${getPerformanceColor(userStats.totalPnL - userStats.totalBrokerage)}`}>
                  {formatCurrency(userStats.totalPnL - userStats.totalBrokerage)}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-sm">Total Brokerage</Text>
                <Text className="text-red-400 text-lg font-bold">
                  {formatCurrency(userStats.totalBrokerage)}
                </Text>
              </View>
            </View>
          </View>

          {/* Referral Section */}
          <TouchableOpacity
            onPress={() => setShowReferralModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 mb-4"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-lg font-bold">🎁 Refer & Earn</Text>
                <Text className="text-gray-200 text-sm">
                  Invite friends and earn ₹1,000 each!
                </Text>
              </View>
              <Text className="text-white text-2xl">→</Text>
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <Text className="text-white text-xl font-bold mb-4">Settings</Text>
          
          <View className="bg-gray-800 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
              <View>
                <Text className="text-white font-medium">Dark Mode</Text>
                <Text className="text-gray-400 text-sm">Use dark theme</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={settings.darkMode ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
              <View>
                <Text className="text-white font-medium">Notifications</Text>
                <Text className="text-gray-400 text-sm">Receive trade alerts and updates</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={settings.notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View>
                <Text className="text-white font-medium">Brokerage Simulation</Text>
                <Text className="text-gray-400 text-sm">Charge ₹20 per trade for realistic experience</Text>
              </View>
              <Switch
                value={settings.brokerageSimulation}
                onValueChange={(value) => updateSetting('brokerageSimulation', value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={settings.brokerageSimulation ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-lg p-4"
          >
            <Text className="text-white font-bold text-center text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Referral Modal */}
      <Modal
        visible={showReferralModal}
        animationType="slide"
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View className="flex-1 bg-gray-900">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <Text className="text-white text-xl font-bold">Refer & Earn</Text>
            <TouchableOpacity
              onPress={() => setShowReferralModal(false)}
              className="bg-gray-700 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            <ReferralRewardSystem
              userId={user.id}
              userEmail={user.email}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}