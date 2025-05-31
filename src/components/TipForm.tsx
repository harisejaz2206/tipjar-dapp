'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { TipTransaction, EthereumWindow } from '@/types';

declare let window: EthereumWindow;

interface TipFormProps {
  contractAddress?: string;
  onTipSent?: (transaction: TipTransaction) => void;
}

export default function TipForm({ contractAddress, onTipSent }: TipFormProps) {
  const { isConnected, updateBalance, isClient } = useWallet();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !contractAddress || typeof window === 'undefined' || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid tip amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create transaction
      const transaction = {
        to: contractAddress,
        value: ethers.parseEther(amount),
        data: message ? ethers.hexlify(ethers.toUtf8Bytes(message)) : '0x',
      };

      const tx = await signer.sendTransaction(transaction);
      
      const tipTransaction: TipTransaction = {
        amount,
        message,
        hash: tx.hash,
        status: 'pending',
      };

      if (onTipSent) {
        onTipSent(tipTransaction);
      }

      // Wait for confirmation
      await tx.wait();
      
      // Update balances
      await updateBalance();
      
      // Reset form
      setAmount('');
      setMessage('');
      
      if (onTipSent) {
        onTipSent({ ...tipTransaction, status: 'success' });
      }

    } catch (err: unknown) {
      console.error('Error sending tip:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tip';
      setError(errorMessage);
      
      if (onTipSent) {
        onTipSent({
          amount,
          message,
          status: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = ['0.001', '0.01', '0.1', '1.0'];

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Loading tip form...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 
                      flex items-center justify-center opacity-50">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
          </svg>
        </div>
        <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">Send a Tip</h3>
        <p className="text-gray-500 font-rajdhani">Connect your wallet to send tips</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                        flex items-center justify-center glow-purple">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-orbitron font-bold text-white">Send a Tip</h2>
            <p className="text-gray-300 font-rajdhani">Support the creator with ETH</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
            Tip Amount (ETH)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl 
                       text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-400/20 transition-all duration-300
                       font-orbitron text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-blue-400 font-orbitron font-bold">ETH</span>
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex space-x-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 
                         rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-300
                         font-rajdhani"
              >
                {quickAmount} ETH
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message with your tip..."
            rows={3}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl 
                     text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none
                     focus:ring-2 focus:ring-blue-400/20 transition-all duration-300
                     font-rajdhani resize-none"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 font-rajdhani">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 
                   hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-orbitron 
                   font-bold text-lg transition-all duration-300 transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   border border-purple-400/50 glow-purple hover:glow-pink"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending Tip...</span>
            </div>
          ) : (
            `Send ${amount || '0'} ETH Tip`
          )}
        </button>
      </form>

      {/* Transaction Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300 font-rajdhani">
          💡 Your tip will be sent directly to the smart contract on the Ethereum blockchain.
          Transaction fees (gas) will apply.
        </p>
      </div>
    </div>
  );
} 