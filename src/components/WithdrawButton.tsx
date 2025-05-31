'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { EthereumWindow } from '@/types';

declare let window: EthereumWindow;

interface WithdrawButtonProps {
  contractAddress?: string;
  contractOwner?: string;
  onWithdraw?: (success: boolean, txHash?: string) => void;
}

export default function WithdrawButton({ 
  contractAddress, 
  contractOwner, 
  onWithdraw 
}: WithdrawButtonProps) {
  const { address, isConnected, updateBalance, isClient } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = isConnected && address && contractOwner && 
                  address.toLowerCase() === contractOwner.toLowerCase();

  const handleWithdraw = async () => {
    if (!isConnected || !contractAddress || typeof window === 'undefined' || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      setError('Only the contract owner can withdraw funds');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // For this example, we'll send a transaction to call the withdraw function
      // In a real implementation, you'd use the contract ABI
      const contractBalance = await provider.getBalance(contractAddress);
      
      if (contractBalance === BigInt(0)) {
        setError('No funds available to withdraw');
        return;
      }

      // Simple withdrawal transaction (this would normally use contract ABI)
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: '0x3ccfd60b', // withdraw() function selector
        gasLimit: 100000,
      });

      await tx.wait();
      
      // Update balances
      await updateBalance();
      
      if (onWithdraw) {
        onWithdraw(true, tx.hash);
      }

    } catch (err: unknown) {
      console.error('Error withdrawing funds:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw funds';
      setError(errorMessage);
      
      if (onWithdraw) {
        onWithdraw(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Loading withdrawal...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center opacity-50">
        <p className="text-gray-500 font-rajdhani">Connect wallet to access withdrawal</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 
                      flex items-center justify-center opacity-50">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-orbitron font-bold text-gray-400 mb-2">Owner Only</h3>
        <p className="text-gray-500 font-rajdhani">Only the contract owner can withdraw funds</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 
                        flex items-center justify-center glow-green">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-orbitron font-bold text-white">Withdraw Funds</h2>
            <p className="text-gray-300 font-rajdhani">Transfer accumulated tips to your wallet</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 font-rajdhani">{error}</p>
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={isLoading}
        className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-500 
                 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-orbitron 
                 font-bold text-lg transition-all duration-300 transform hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                 border border-green-400/50 glow-green hover:glow-emerald"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing Withdrawal...</span>
          </div>
        ) : (
          'Withdraw All Tips'
        )}
      </button>

      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300 font-rajdhani">
          🔒 As the contract owner, you can withdraw all accumulated tips to your wallet.
          This action will transfer all ETH from the contract to your address.
        </p>
      </div>
    </div>
  );
} 