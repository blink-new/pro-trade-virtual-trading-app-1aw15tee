import { supabase } from '../lib/supabase';
import { marketDataService } from './marketDataService';

export interface TradeRequest {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  userId: string;
}

export interface TradeResult {
  success: boolean;
  message: string;
  tradeId?: string;
  newBalance?: number;
  brokerage?: number;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  investedAmount: number;
  currentValue: number;
}

class TradingService {
  private readonly BROKERAGE_RATE = 20; // ₹20 flat per trade

  async executeTrade(tradeRequest: TradeRequest, brokerageEnabled: boolean = true): Promise<TradeResult> {
    try {
      const { symbol, type, quantity, price, userId } = tradeRequest;
      
      // Get user's current balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('virtual_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const currentBalance = userData.virtual_balance;
      const brokerage = brokerageEnabled ? this.BROKERAGE_RATE : 0;
      const totalAmount = (price * quantity) + brokerage;

      // Check if user has sufficient balance for BUY orders
      if (type === 'BUY' && currentBalance < totalAmount) {
        return {
          success: false,
          message: 'Insufficient balance for this trade'
        };
      }

      // For SELL orders, check if user has the position
      if (type === 'SELL') {
        const { data: position } = await supabase
          .from('positions')
          .select('quantity')
          .eq('user_id', userId)
          .eq('symbol', symbol)
          .single();

        if (!position || position.quantity < quantity) {
          return {
            success: false,
            message: 'Insufficient quantity to sell'
          };
        }
      }

      // Calculate new balance
      const balanceChange = type === 'BUY' ? -totalAmount : (price * quantity) - brokerage;
      const newBalance = currentBalance + balanceChange;

      // Start transaction
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: userId,
          symbol,
          type,
          quantity,
          price,
          brokerage,
          total_amount: totalAmount,
          status: 'OPEN'
        })
        .select()
        .single();

      if (tradeError) throw tradeError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ virtual_balance: newBalance })
        .eq('id', userId);

      if (balanceError) throw balanceError;

      // Update or create position
      await this.updatePosition(userId, symbol, type, quantity, price);

      return {
        success: true,
        message: `${type} order executed successfully`,
        tradeId: trade.id,
        newBalance,
        brokerage
      };

    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        message: 'Failed to execute trade. Please try again.'
      };
    }
  }

  private async updatePosition(userId: string, symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number) {
    try {
      // Get existing position
      const { data: existingPosition } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .single();

      if (existingPosition) {
        // Update existing position
        let newQuantity: number;
        let newAvgPrice: number;

        if (type === 'BUY') {
          const totalValue = (existingPosition.quantity * existingPosition.avg_price) + (quantity * price);
          newQuantity = existingPosition.quantity + quantity;
          newAvgPrice = totalValue / newQuantity;
        } else {
          newQuantity = existingPosition.quantity - quantity;
          newAvgPrice = existingPosition.avg_price; // Keep same avg price for sells
        }

        if (newQuantity <= 0) {
          // Close position if quantity becomes 0 or negative
          await supabase
            .from('positions')
            .delete()
            .eq('id', existingPosition.id);
        } else {
          // Update position
          const currentPrice = marketDataService.getStockData(symbol)?.price || price;
          const pnl = (currentPrice - newAvgPrice) * newQuantity;
          const pnlPercentage = ((currentPrice - newAvgPrice) / newAvgPrice) * 100;

          await supabase
            .from('positions')
            .update({
              quantity: newQuantity,
              avg_price: newAvgPrice,
              current_price: currentPrice,
              pnl,
              pnl_percentage: pnlPercentage,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPosition.id);
        }
      } else if (type === 'BUY') {
        // Create new position for BUY orders
        const currentPrice = marketDataService.getStockData(symbol)?.price || price;
        const pnl = (currentPrice - price) * quantity;
        const pnlPercentage = ((currentPrice - price) / price) * 100;

        await supabase
          .from('positions')
          .insert({
            user_id: userId,
            symbol,
            quantity,
            avg_price: price,
            current_price: currentPrice,
            pnl,
            pnl_percentage: pnlPercentage
          });
      }
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }

  async getPositions(userId: string): Promise<Position[]> {
    try {
      const { data: positions, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update current prices and P&L
      const updatedPositions = positions.map(position => {
        const marketData = marketDataService.getStockData(position.symbol);
        const currentPrice = marketData?.price || position.current_price;
        const pnl = (currentPrice - position.avg_price) * position.quantity;
        const pnlPercentage = ((currentPrice - position.avg_price) / position.avg_price) * 100;
        const investedAmount = position.avg_price * position.quantity;
        const currentValue = currentPrice * position.quantity;

        return {
          id: position.id,
          symbol: position.symbol,
          quantity: position.quantity,
          avgPrice: position.avg_price,
          currentPrice,
          pnl,
          pnlPercentage,
          investedAmount,
          currentValue
        };
      });

      // Update positions in database with current prices
      for (const position of updatedPositions) {
        await supabase
          .from('positions')
          .update({
            current_price: position.currentPrice,
            pnl: position.pnl,
            pnl_percentage: position.pnlPercentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', position.id);
      }

      return updatedPositions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  async squareOffPosition(userId: string, positionId: string): Promise<TradeResult> {
    try {
      // Get position details
      const { data: position, error: positionError } = await supabase
        .from('positions')
        .select('*')
        .eq('id', positionId)
        .eq('user_id', userId)
        .single();

      if (positionError || !position) {
        return {
          success: false,
          message: 'Position not found'
        };
      }

      // Get current market price
      const marketData = marketDataService.getStockData(position.symbol);
      const currentPrice = marketData?.price || position.current_price;

      // Execute sell trade
      const sellResult = await this.executeTrade({
        symbol: position.symbol,
        type: 'SELL',
        quantity: position.quantity,
        price: currentPrice,
        userId
      }, true);

      if (sellResult.success) {
        // Mark all related trades as closed
        await supabase
          .from('trades')
          .update({ 
            status: 'CLOSED',
            closed_at: new Date().toISOString(),
            pnl: position.pnl
          })
          .eq('user_id', userId)
          .eq('symbol', position.symbol)
          .eq('status', 'OPEN');

        return {
          success: true,
          message: `Position squared off successfully. P&L: ₹${position.pnl.toFixed(2)}`,
          newBalance: sellResult.newBalance
        };
      }

      return sellResult;
    } catch (error) {
      console.error('Error squaring off position:', error);
      return {
        success: false,
        message: 'Failed to square off position'
      };
    }
  }

  async getTradeHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return trades || [];
    } catch (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }
  }

  async getPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    totalPnL: number;
    totalPnLPercentage: number;
    totalInvested: number;
    dayPnL: number;
    totalBrokerage: number;
  }> {
    try {
      const positions = await this.getPositions(userId);
      
      const totalInvested = positions.reduce((sum, pos) => sum + pos.investedAmount, 0);
      const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
      const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      // Calculate total brokerage paid
      const { data: trades } = await supabase
        .from('trades')
        .select('brokerage')
        .eq('user_id', userId);

      const totalBrokerage = trades?.reduce((sum, trade) => sum + (trade.brokerage || 0), 0) || 0;

      // Mock day P&L (in real app, calculate from today's trades)
      const dayPnL = totalPnL * 0.1; // Assume 10% of total P&L is from today

      return {
        totalValue,
        totalPnL,
        totalPnLPercentage,
        totalInvested,
        dayPnL,
        totalBrokerage
      };
    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      return {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        totalInvested: 0,
        dayPnL: 0,
        totalBrokerage: 0
      };
    }
  }

  async getUserSettings(userId: string): Promise<{ brokerageSimulation: boolean }> {
    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('brokerage_simulation')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        brokerageSimulation: settings?.brokerage_simulation ?? true
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return { brokerageSimulation: true };
    }
  }

  async updateUserSettings(userId: string, settings: { brokerageSimulation?: boolean }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          brokerage_simulation: settings.brokerageSimulation,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }
}

export const tradingService = new TradingService();