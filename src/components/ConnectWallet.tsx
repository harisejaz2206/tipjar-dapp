'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { EthereumWindow } from '@/types';

declare let window: EthereumWindow;

/**
 * ConnectWallet Component
 * 
 * This component handles the entire wallet connection flow:
 * 1. Displays connection UI based on wallet state
 * 2. Manages MetaMask connection/disconnection
 * 3. Shows wallet address when connected
 * 4. Handles loading states and errors
 */
export default function ConnectWallet() {
  // Get wallet state including address from the hook
  const { address, isConnected, isLoading, connectWallet, disconnectWallet, isClient } = useWallet();
  
  // Local component state (syncs with global wallet state)
  const [localAddress, setLocalAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  /**
   * Sync local address with global wallet state
   */
  useEffect(() => {
    setLocalAddress(address);
  }, [address]);

  /**
   * Get current wallet address from MetaMask
   */
  const getCurrentAddress = async () => {
    if (!isClient || typeof window === 'undefined' || !window.ethereum) return null;
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      }) as string[];
      
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current address:', error);
      return null;
    }
  };

  /**
   * Handle wallet connection
   */
  const handleConnect = async () => {
    try {
      setError(null);
      const address = await connectWallet();
      setLocalAddress(address);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
    }
  };

  /**
   * Handle wallet switching - triggers MetaMask account selection
   */
  const handleSwitchWallet = async () => {
    if (!isClient || typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not available');
      return;
    }

    try {
      setIsSwitching(true);
      setError(null);

      // Request permissions to choose a different account
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      // Get the newly selected account
      const newAddress = await getCurrentAddress();
      setLocalAddress(newAddress);

    } catch (err: unknown) {
      console.error('Error switching wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch wallet';
      setError(errorMessage);
    } finally {
      setIsSwitching(false);
    }
  };

  /**
   * Handle disconnection
   */
  const handleDisconnect = () => {
    disconnectWallet();
    setLocalAddress(null);
  };

  /**
   * Format wallet address for display
   * Shows first 6 and last 4 characters: 0x1234...abcd
   * This is a common pattern in Web3 UIs for readability
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * HYDRATION PROTECTION
   * 
   * This prevents React hydration mismatches between server and client.
   * The server doesn't know about MetaMask, but the client does.
   * We show a loading state until we're sure we're on the client side.
   */
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30"></div>
          <p className="text-gray-400 font-rajdhani">Loading wallet...</p>
        </div>
      </div>
    );
  }

  /**
   * CONNECTED STATE UI
   * 
   * When wallet is connected, show:
   * - Green indicator dot (animated pulse)
   * - Formatted wallet address
   * - Disconnect button
   */
  if (isConnected && localAddress) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl overflow-hidden relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
        
        <div className="relative z-10">
          {/* Header with status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Enhanced status indicator */}
              <div className="relative">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse glow-green"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div>
                <p className="text-xs text-green-300 font-rajdhani font-medium uppercase tracking-wider">
                  🟢 Connected
                </p>
                <p className="text-sm text-gray-400 font-rajdhani">
                  MetaMask Wallet
                </p>
              </div>
            </div>

            {/* Connection indicator badge */}
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-xs text-green-300 font-rajdhani font-medium">ONLINE</span>
            </div>
          </div>

          {/* Wallet address display */}
          <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-rajdhani mb-1">WALLET ADDRESS</p>
                <p className="text-xl font-orbitron font-bold text-white tracking-wider">
                  {formatAddress(localAddress)}
                </p>
              </div>
              
              {/* Copy address button */}
              <button
                onClick={() => navigator.clipboard.writeText(localAddress)}
                className="ml-3 p-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg 
                         transition-all duration-300 group"
                title="Copy address"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 font-rajdhani text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            {/* Switch Wallet Button */}
            <button
              onClick={handleSwitchWallet}
              disabled={isSwitching}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                       hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/50 
                       rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300
                       font-rajdhani font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-105 active:scale-95"
            >
              {isSwitching ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
                  <span>Switching...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Switch Wallet</span>
                </div>
              )}
            </button>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 
                       hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/50 
                       rounded-xl text-red-300 hover:text-red-200 transition-all duration-300
                       font-rajdhani font-medium transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * DISCONNECTED STATE UI
   * 
   * When wallet is not connected, show:
   * - Welcome message with icon
   * - Error message (if any)
   * - Connect button with loading state
   * - Link to install MetaMask
   */
  return (
    <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      
      <div className="relative z-10">
        {/* Enhanced header */}
        <div className="mb-8">
          {/* Glowing icon with animation */}
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                          flex items-center justify-center glow-blue relative">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
              
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-orbitron font-bold text-white mb-3 tracking-wide">
            Connect Wallet
          </h2>
          <p className="text-gray-300 font-rajdhani text-lg leading-relaxed max-w-md mx-auto">
            Connect your MetaMask wallet to start sending tips on the blockchain
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-300 font-rajdhani">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced connect button */}
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full py-5 px-8 bg-gradient-to-r from-blue-500 to-purple-600 
                   hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-orbitron 
                   font-bold text-lg transition-all duration-300 transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   border border-blue-400/50 glow-blue hover:glow-purple shadow-2xl
                   active:scale-95"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting to MetaMask...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              </svg>
              <span>Connect MetaMask</span>
            </div>
          )}
        </button>

        {/* Help section */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-300 font-rajdhani mb-2">
            💡 First time using MetaMask?
          </p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 
                     font-rajdhani font-medium transition-colors duration-300"
          >
            <span>Install MetaMask Extension</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 