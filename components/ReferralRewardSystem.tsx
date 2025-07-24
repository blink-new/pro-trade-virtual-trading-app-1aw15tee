import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../src/lib/supabase';

interface ReferralRewardSystemProps {
  userId: string;
  userEmail: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalRewards: number;
  recentReferrals: Array<{
    email: string;
    joinedAt: string;
    rewardEarned: number;
  }>;
}

export default function ReferralRewardSystem({ userId, userEmail }: ReferralRewardSystemProps) {
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralStats();
  }, [userId]);

  const loadReferralStats = async () => {
    try {
      setLoading(true);

      // Get user's referral code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get referral statistics
      const { data: referrals, error: referralsError } = await supabase
        .from('users')
        .select('email, created_at')
        .eq('referred_by', userId)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      const stats: ReferralStats = {
        referralCode: userData.referral_code,
        totalReferrals: referrals.length,
        totalRewards: referrals.length * 1000, // ₹1000 per referral
        recentReferrals: referrals.slice(0, 5).map(ref => ({
          email: ref.email,
          joinedAt: ref.created_at,
          rewardEarned: 1000
        }))
      };

      setReferralStats(stats);
    } catch (error) {
      console.error('Error loading referral stats:', error);
      Alert.alert('Error', 'Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!referralStats) return;

    try {
      await Clipboard.setStringAsync(referralStats.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const shareViaWhatsApp = async () => {
    if (!referralStats) return;

    const message = `🚀 Join PRO TRADE - Virtual Stock Trading App!

Learn stock trading without any risk! 📈

✅ ₹1,00,000 virtual balance to start
✅ Real-time market data
✅ Practice with stocks & options
✅ No real money involved

Use my referral code: ${referralStats.referralCode}

Both of us will get ₹1,000 bonus! 💰

Download now: https://pro-trade-virtual-trading-app-1aw15tee.sites.blink.new`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to regular share
        await Share.share({
          message,
          title: 'Join PRO TRADE - Virtual Trading App'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share referral link');
    }
  };

  const shareGeneral = async () => {
    if (!referralStats) return;

    const message = `🚀 Join PRO TRADE - Virtual Stock Trading App!

Learn stock trading without any risk! 📈

Use my referral code: ${referralStats.referralCode}
Both of us will get ₹1,000 bonus! 💰

Download: https://pro-trade-virtual-trading-app-1aw15tee.sites.blink.new`;

    try {
      await Share.share({
        message,
        title: 'Join PRO TRADE - Virtual Trading App'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View className="bg-gray-800 rounded-lg p-6">
        <Text className="text-white text-center">Loading referral data...</Text>
      </View>
    );
  }

  if (!referralStats) {
    return (
      <View className="bg-gray-800 rounded-lg p-6">
        <Text className="text-red-500 text-center">Failed to load referral data</Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-white text-2xl font-bold mb-2">🎁 Refer & Earn</Text>
        <Text className="text-gray-400 text-center">
          Invite friends and earn ₹1,000 for each successful referral!
        </Text>
      </View>

      {/* Referral Code */}
      <View className="bg-gray-900 rounded-lg p-4 mb-6">
        <Text className="text-gray-400 text-sm mb-2">Your Referral Code</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold tracking-wider">
            {referralStats.referralCode}
          </Text>
          <TouchableOpacity
            onPress={copyReferralCode}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-gray-900 rounded-lg p-4 flex-1 mr-2">
          <Text className="text-gray-400 text-sm">Total Referrals</Text>
          <Text className="text-white text-2xl font-bold">{referralStats.totalReferrals}</Text>
        </View>
        <View className="bg-gray-900 rounded-lg p-4 flex-1 ml-2">
          <Text className="text-gray-400 text-sm">Total Rewards</Text>
          <Text className="text-green-500 text-2xl font-bold">₹{referralStats.totalRewards.toLocaleString()}</Text>
        </View>
      </View>

      {/* Share Buttons */}
      <View className="space-y-3 mb-6">
        <TouchableOpacity
          onPress={shareViaWhatsApp}
          className="bg-green-600 p-4 rounded-lg flex-row items-center justify-center"
        >
          <Text className="text-white font-bold text-lg mr-2">📱</Text>
          <Text className="text-white font-bold">Share via WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shareGeneral}
          className="bg-blue-600 p-4 rounded-lg flex-row items-center justify-center"
        >
          <Text className="text-white font-bold text-lg mr-2">📤</Text>
          <Text className="text-white font-bold">Share via Other Apps</Text>
        </TouchableOpacity>
      </View>

      {/* How it Works */}
      <View className="bg-gray-900 rounded-lg p-4 mb-6">
        <Text className="text-white font-bold mb-3">How it Works</Text>
        <View className="space-y-2">
          <View className="flex-row items-start">
            <Text className="text-blue-500 font-bold mr-2">1.</Text>
            <Text className="text-gray-300 flex-1">Share your referral code with friends</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-blue-500 font-bold mr-2">2.</Text>
            <Text className="text-gray-300 flex-1">They sign up using your code</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-blue-500 font-bold mr-2">3.</Text>
            <Text className="text-gray-300 flex-1">Both get ₹1,000 virtual bonus instantly!</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-blue-500 font-bold mr-2">4.</Text>
            <Text className="text-gray-300 flex-1">You also get 50 leaderboard points</Text>
          </View>
        </View>
      </View>

      {/* Recent Referrals */}
      {referralStats.recentReferrals.length > 0 && (
        <View className="bg-gray-900 rounded-lg p-4">
          <Text className="text-white font-bold mb-3">Recent Referrals</Text>
          {referralStats.recentReferrals.map((referral, index) => (
            <View key={index} className="flex-row items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
              <View>
                <Text className="text-white font-medium">
                  {referral.email.replace(/(.{3}).*@/, '$1***@')}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {new Date(referral.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-green-500 font-bold">+₹{referral.rewardEarned}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Terms */}
      <View className="mt-4">
        <Text className="text-gray-500 text-xs text-center">
          * Rewards are added to virtual balance only. Terms and conditions apply.
        </Text>
      </View>
    </View>
  );
}