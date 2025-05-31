'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

export default function ConnectWallet() {
  const { address, isConnected, isLoading, connectWallet, disconnectWallet, isClient } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Loading wallet...</p>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse glow-green"></div>
            <div>
              <p className="text-sm text-gray-300 font-rajdhani">Connected Wallet</p>
              <p className="text-lg font-orbitron font-bold text-white">
                {formatAddress(address)}
              </p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                     rounded-lg text-red-300 hover:text-red-200 transition-all duration-300
                     font-rajdhani font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                      flex items-center justify-center glow-blue">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-300 font-rajdhani">
          Connect your MetaMask wallet to start sending tips on the blockchain
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 font-rajdhani">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 
                 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-orbitron 
                 font-bold text-lg transition-all duration-300 transform hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                 border border-blue-400/50 glow-blue hover:glow-purple"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          'Connect MetaMask'
        )}
      </button>

      <div className="mt-4 text-sm text-gray-400 font-rajdhani">
        Don&apos;t have MetaMask?{' '}
        <a 
          href="https://metamask.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Install it here
        </a>
      </div>
    </div>
  );
} 