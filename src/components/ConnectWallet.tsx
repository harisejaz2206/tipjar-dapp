'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

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
  // Get wallet state and functions from our custom hook
  // This hook manages all the Web3 wallet logic
  const { address, isConnected, isLoading, connectWallet, disconnectWallet, isClient } = useWallet();
  
  // Local state for handling connection errors
  // This is separate from the global wallet state
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle wallet connection attempt
   * Wraps the connectWallet function with error handling
   */
  const handleConnect = async () => {
    try {
      setError(null); // Clear any previous errors
      await connectWallet(); // Call the wallet connection function
    } catch (err: unknown) {
      // TypeScript-safe error handling
      // We don't know what type of error we'll get, so we check
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
    }
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
        <p className="text-gray-400 font-rajdhani">Loading wallet...</p>
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
  if (isConnected && address) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {/* Left side: Status indicator and address */}
          <div className="flex items-center space-x-4">
            {/* Animated green dot to show connection status */}
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse glow-green"></div>
            <div>
              {/* Label and formatted address */}
              <p className="text-sm text-gray-300 font-rajdhani">Connected Wallet</p>
              <p className="text-lg font-orbitron font-bold text-white">
                {formatAddress(address)}
              </p>
            </div>
          </div>
          
          {/* Right side: Disconnect button */}
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
    <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
      {/* Header section with icon and text */}
      <div className="mb-6">
        {/* Glowing shield icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                      flex items-center justify-center glow-blue">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
        
        {/* Title and description */}
        <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-300 font-rajdhani">
          Connect your MetaMask wallet to start sending tips on the blockchain
        </p>
      </div>

      {/* Error display (only shows if there's an error) */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 font-rajdhani">{error}</p>
        </div>
      )}

      {/* Main connect button */}
      <button
        onClick={handleConnect}
        disabled={isLoading} // Disable during connection attempt
        className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 
                 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-orbitron 
                 font-bold text-lg transition-all duration-300 transform hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                 border border-blue-400/50 glow-blue hover:glow-purple"
      >
        {/* Conditional content based on loading state */}
        {isLoading ? (
          // Loading state: spinner + text
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          // Normal state: just text
          'Connect MetaMask'
        )}
      </button>

      {/* Help link for users without MetaMask */}
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