import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owywnbogucwtegirqsjl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93eXduYm9ndWN3dGVnaXJxc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDA3OTgsImV4cCI6MjA2ODkxNjc5OH0.s9RuGGStteD_7_7Y-BGFoqIhROcX5wBPurb5WtNx8Ns';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  display_name?: string;
  virtual_balance: number;
  total_pnl: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  brokerage: number;
  total_amount: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
  created_at: string;
  closed_at?: string;
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  pnl: number;
  pnl_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  symbol: string;
  type: 'PRICE_TARGET' | 'MISSED_OPPORTUNITY' | 'HIGH_VOLATILITY';
  target_price?: number;
  current_price: number;
  message: string;
  is_triggered: boolean;
  created_at: string;
  triggered_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  brokerage_simulation: boolean;
  created_at: string;
  updated_at: string;
}