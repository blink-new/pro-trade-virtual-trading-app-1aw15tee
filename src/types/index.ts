export interface User {
  id: string
  email: string
  display_name?: string
  virtual_balance: number
  referral_code?: string
  referred_by?: string
  total_pnl: number
  total_trades: number
  win_rate: number
  leaderboard_points: number
  brokerage_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total_amount: number
  brokerage: number
  net_amount: number
  trade_date: string
  sector?: string
  instrument_type: string
}

export interface Position {
  id: string
  user_id: string
  symbol: string
  quantity: number
  avg_price: number
  current_price: number
  pnl: number
  sector?: string
  instrument_type: string
  created_at: string
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  symbol: string
  added_at: string
}

export interface Alert {
  id: string
  user_id: string
  symbol: string
  alert_type: string
  target_price?: number
  current_price?: number
  message?: string
  is_triggered: boolean
  created_at: string
  triggered_at?: string
}

export interface UserSettings {
  id: string
  user_id: string
  dark_mode: boolean
  notifications_enabled: boolean
  sound_enabled: boolean
  brokerage_simulation: boolean
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referee_id: string
  bonus_amount: number
  points_awarded: number
  created_at: string
}

export interface MarketData {
  symbol: string
  price: number
  change: number
  change_percent: number
  volume: number
  market_cap?: number
  pe_ratio?: number
  eps?: number
  week_52_high?: number
  week_52_low?: number
  sector: string
  last_updated: string
}