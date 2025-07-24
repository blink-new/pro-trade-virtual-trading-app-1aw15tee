import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'
import { useFrameworkReady } from '@/hooks/useFrameworkReady'
import blink from '@/src/blink/client'
import '../global.css'

export default function RootLayout() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useFrameworkReady()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg font-semibold text-blue-600">PRO TRADE Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-blue-600 mb-4">PRO TRADE</Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          Virtual Stock Trading Platform
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Please wait while signing in...
        </Text>
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}