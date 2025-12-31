'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface CreditBalanceProps {
  userId: string;
  variant?: 'compact' | 'detailed' | 'minimal' | 'card';
  showHistory?: boolean;
  onPurchase?: () => void;
  className?: string;
}

interface Transaction {
  id: string;
  type: 'deduction' | 'addition' | 'refund';
  amount: number;
  action: string;
  balance_after: number;
  created_at: string;
}

export function CreditBalance({ 
  userId, 
  variant = 'compact', 
  showHistory = false,
  onPurchase,
  className = '' 
}: CreditBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ userId });
      if (showHistory) params.append('history', 'true');
      
      const res = await fetch(`/api/credits?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setBalance(data.balance);
        if (data.history) {
          setHistory(data.history.transactions);
        }
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCredits();
    }
  }, [userId, showHistory]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 text-sm ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  // Minimal variant - just the number
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1.5 text-sm font-medium ${className}`}>
        <Coins className="w-4 h-4 text-yellow-500" />
        <span>{balance?.toLocaleString()}</span>
      </div>
    );
  }

  // Compact variant - icon + number + optional buy button
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full border border-yellow-500/20">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {balance?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">credits</span>
        </div>
        {onPurchase && (
          <button
            onClick={onPurchase}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            Get More
          </button>
        )}
      </div>
    );
  }

  // Card variant - full card with balance and quick stats
  if (variant === 'card') {
    const lowBalance = (balance || 0) < 10;
    
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Balance</h3>
          <button 
            onClick={fetchCredits}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${lowBalance ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gradient-to-br from-yellow-400 to-orange-500'}`}>
            <Coins className={`w-6 h-6 ${lowBalance ? 'text-red-500' : 'text-white'}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {balance?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">credits available</p>
          </div>
        </div>

        {lowBalance && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>Low balance - consider purchasing more credits</span>
          </div>
        )}

        {onPurchase && (
          <button
            onClick={onPurchase}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Purchase Credits
          </button>
        )}
      </div>
    );
  }

  // Detailed variant - balance + recent transactions
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{balance?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">credits available</p>
          </div>
        </div>
        {onPurchase && (
          <button
            onClick={onPurchase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Credits
          </button>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {tx.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditBalance;
