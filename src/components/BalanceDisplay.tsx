'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { EthereumWindow } from '@/types';

declare let window: EthereumWindow;

interface BalanceDisplayProps {
  contractAddress?: string;
  onBalanceUpdate?: (userBalance: string, contractBalance: string) => void;
}

export default function BalanceDisplay({ contractAddress, onBalanceUpdate }: BalanceDisplayProps) {
  const { balance: userBalance, isConnected, isClient } = useWallet();
  const [contractBalance, setContractBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const fetchContractBalance = useCallback(async () => {
    if (!contractAddress || typeof window === 'undefined' || !window.ethereum) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      const formattedBalance = ethers.formatEther(balance);
      setContractBalance(formattedBalance);
      
      if (onBalanceUpdate) {
        onBalanceUpdate(userBalance, formattedBalance);
      }
    } catch (error) {
      console.error('Error fetching contract balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, userBalance, onBalanceUpdate]);

  useEffect(() => {
    if (contractAddress && isConnected && isClient) {
      fetchContractBalance();
    }
  }, [contractAddress, isConnected, fetchContractBalance, isClient]);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.0000';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Connect your wallet to view balances</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User Balance */}
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center glow-blue">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-white">Your Balance</h3>
              <p className="text-sm text-gray-300 font-rajdhani">Available ETH</p>
            </div>
          </div>
          <div className="text-3xl font-orbitron font-bold text-white mb-2">
            {formatBalance(userBalance)} <span className="text-lg text-blue-400">ETH</span>
          </div>
          <div className="text-sm text-gray-400 font-rajdhani">
            ≈ ${(parseFloat(userBalance) * 2000).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Contract Balance */}
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center glow-green">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-white">Tip Jar</h3>
              <p className="text-sm text-gray-300 font-rajdhani">Total Tips Collected</p>
            </div>
          </div>
          <div className="text-3xl font-orbitron font-bold text-white mb-2">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-lg">Loading...</span>
              </div>
            ) : (
              <>
                {formatBalance(contractBalance)} <span className="text-lg text-green-400">ETH</span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-400 font-rajdhani">
            ≈ ${(parseFloat(contractBalance) * 2000).toFixed(2)} USD
          </div>
        </div>
      </div>
    </div>
  );
} 