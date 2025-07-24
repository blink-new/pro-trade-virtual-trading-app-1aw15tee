import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Gift, Copy, Share2, Users, Trophy, DollarSign } from 'lucide-react-native'

export function ReferralSystem() {
  const [referralData] = useState({
    referralCode: 'TRADE2024',
    totalReferrals: 3,
    totalEarnings: 3000,
    pendingReferrals: 1,
    leaderboardPoints: 150
  })

  const copyReferralCode = () => {
    // In a real app, this would copy to clipboard
    Alert.alert('Copied!', 'Referral code copied to clipboard')
  }

  const shareReferralCode = () => {
    const message = `🚀 Join PRO TRADE - Virtual Stock Trading App!\n\n` +
      `Use my referral code: ${referralData.referralCode}\n\n` +
      `✅ Get ₹1,000 virtual balance bonus\n` +
      `✅ Learn stock trading risk-free\n` +
      `✅ Real-time market data\n` +
      `✅ Virtual portfolio tracking\n\n` +
      `Download now and start your trading journey!`

    Alert.alert('Share Referral Code', message)
  }

  const shareViaWhatsApp = () => {
    const message = `🚀 *PRO TRADE* - Virtual Stock Trading App!\n\n` +
      `Use my referral code: *${referralData.referralCode}*\n\n` +
      `✅ Get ₹1,000 virtual balance bonus\n` +
      `✅ Learn stock trading risk-free\n` +
      `✅ Real-time market data\n` +
      `✅ Virtual portfolio tracking\n\n` +
      `Perfect for learning trading without any risk! 📈`

    Alert.alert('Share via WhatsApp', message)
  }

  return (
    <View className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full items-center justify-center">
          <Gift size={24} color="white" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-900">Referral Program</Text>
          <Text className="text-gray-600">Invite friends and earn rewards!</Text>
        </View>
      </View>

      {/* Referral Code */}
      <View className="bg-white rounded-lg p-4 mb-6 border-2 border-dashed border-purple-200">
        <Text className="text-sm text-gray-600 mb-2">Your Referral Code</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-purple-600 tracking-wider">
            {referralData.referralCode}
          </Text>
          <TouchableOpacity
            onPress={copyReferralCode}
            className="flex-row items-center bg-purple-100 px-3 py-2 rounded-lg"
          >
            <Copy size={16} color="#7c3aed" />
            <Text className="text-purple-600 font-medium ml-2">Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white rounded-lg p-4 mr-2">
          <View className="flex-row items-center mb-2">
            <Users size={20} color="#3b82f6" />
            <Text className="text-blue-600 font-medium ml-2">Referrals</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{referralData.totalReferrals}</Text>
          <Text className="text-sm text-gray-500">Total invited</Text>
        </View>

        <View className="flex-1 bg-white rounded-lg p-4 ml-2">
          <View className="flex-row items-center mb-2">
            <DollarSign size={20} color="#10b981" />
            <Text className="text-green-600 font-medium ml-2">Earnings</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">₹{referralData.totalEarnings}</Text>
          <Text className="text-sm text-gray-500">Bonus earned</Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="flex-1 bg-white rounded-lg p-4 mr-2">
          <View className="flex-row items-center mb-2">
            <Trophy size={20} color="#f59e0b" />
            <Text className="text-yellow-600 font-medium ml-2">Points</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{referralData.leaderboardPoints}</Text>
          <Text className="text-sm text-gray-500">Leaderboard</Text>
        </View>

        <View className="flex-1 bg-white rounded-lg p-4 ml-2">
          <View className="flex-row items-center mb-2">
            <Gift size={20} color="#8b5cf6" />
            <Text className="text-purple-600 font-medium ml-2">Pending</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{referralData.pendingReferrals}</Text>
          <Text className="text-sm text-gray-500">Processing</Text>
        </View>
      </View>

      {/* How it works */}
      <View className="bg-white rounded-lg p-4 mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-3">How it works</Text>
        
        <View className="space-y-3">
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Share your code</Text>
              <Text className="text-gray-600 text-sm">Send your referral code to friends</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">They sign up</Text>
              <Text className="text-gray-600 text-sm">Friend joins using your code</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center mr-3 mt-0.5">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Both get rewards</Text>
              <Text className="text-gray-600 text-sm">₹1,000 bonus + 50 leaderboard points</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Share Buttons */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={shareViaWhatsApp}
          className="bg-green-500 rounded-lg p-4 flex-row items-center justify-center"
        >
          <Share2 size={20} color="white" />
          <Text className="text-white font-bold ml-2">Share via WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shareReferralCode}
          className="bg-blue-500 rounded-lg p-4 flex-row items-center justify-center"
        >
          <Share2 size={20} color="white" />
          <Text className="text-white font-bold ml-2">Share with Others</Text>
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <Text className="text-xs text-gray-500 text-center mt-4">
        * Referral bonus is credited after successful signup. Terms and conditions apply.
      </Text>
    </View>
  )
}