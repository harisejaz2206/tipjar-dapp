'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { EthereumWindow } from '@/types';

// TypeScript declaration to tell the compiler that window has ethereum property
// This extends the global Window interface to include MetaMask's ethereum object
declare let window: EthereumWindow;

/**
 * Props interface for WithdrawButton component
 * 
 * contractAddress: The smart contract address containing the tips
 * contractOwner: The wallet address that owns the contract (can withdraw)
 * onWithdraw: Optional callback when withdrawal completes (success/failure)
 */
interface WithdrawButtonProps {
  contractAddress?: string;
  contractOwner?: string;
  onWithdraw?: (success: boolean, txHash?: string) => void;
}

/**
 * WithdrawButton Component
 * 
 * This component provides owner-only access to withdraw accumulated tips:
 * 1. Checks if connected wallet is the contract owner
 * 2. Validates there are funds available to withdraw
 * 3. Calls the smart contract's withdraw function
 * 4. Transfers all ETH from contract to owner's wallet
 * 5. Updates balances after successful withdrawal
 * 
 * Security Features:
 * - Owner-only access control
 * - Balance validation before withdrawal
 * - Error handling for failed transactions
 * - Clear visual feedback for different states
 * 
 * UI States:
 * - Loading: While checking client-side rendering
 * - Not connected: Prompts to connect wallet
 * - Not owner: Shows locked state with explanation
 * - Owner: Shows active withdrawal button
 */
export default function WithdrawButton({ 
  contractAddress, 
  contractOwner, 
  onWithdraw 
}: WithdrawButtonProps) {
  // Get wallet state and functions from our custom hook
  const { address, isConnected, updateBalance, isClient } = useWallet();
  
  // Component state management
  const [isLoading, setIsLoading] = useState(false);  // Withdrawal in progress
  const [error, setError] = useState<string | null>(null); // Error messages

  /**
   * OWNER VERIFICATION
   * 
   * Checks if the currently connected wallet is the contract owner.
   * Uses case-insensitive comparison since Ethereum addresses can be
   * represented in different cases (checksummed vs lowercase).
   * 
   * All conditions must be true:
   * - Wallet is connected
   * - We have the user's address
   * - We have the contract owner address
   * - Addresses match (case-insensitive)
   */
  const isOwner = isConnected && address && contractOwner && 
                  address.toLowerCase() === contractOwner.toLowerCase();

  /**
   * WITHDRAWAL HANDLER
   * 
   * This function handles the complete withdrawal process:
   * 1. Validates wallet connection and ownership
   * 2. Checks contract has funds to withdraw
   * 3. Calls the smart contract's withdraw function
   * 4. Waits for transaction confirmation
   * 5. Updates user's balance
   * 6. Notifies parent component of result
   */
  const handleWithdraw = async () => {
    /**
     * INITIAL VALIDATION CHECKS
     * 
     * Before attempting blockchain operations, validate:
     * - Wallet is connected
     * - Contract address is provided
     * - MetaMask is available
     */
    if (!isConnected || !contractAddress || typeof window === 'undefined' || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    /**
     * OWNERSHIP VERIFICATION
     * 
     * Double-check that the connected wallet is the contract owner.
     * This is a security measure to prevent unauthorized withdrawal attempts.
     */
    if (!isOwner) {
      setError('Only the contract owner can withdraw funds');
      return;
    }

    try {
      setIsLoading(true);  // Show loading spinner
      setError(null);      // Clear any previous errors

      /**
       * WEB3 SETUP
       * 
       * Create provider and signer for blockchain interaction:
       * - Provider: Read-only connection to query contract balance
       * - Signer: Can sign and send transactions (connected to owner's wallet)
       */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      /**
       * BALANCE CHECK
       * 
       * Before attempting withdrawal, check if the contract actually
       * has any ETH to withdraw. This prevents unnecessary gas fees
       * for empty withdrawal attempts.
       */
      const contractBalance = await provider.getBalance(contractAddress);
      
      if (contractBalance === BigInt(0)) {
        setError('No funds available to withdraw');
        return;
      }

      /**
       * WITHDRAWAL TRANSACTION
       * 
       * NOTE: This is a simplified example using a raw transaction.
       * In a real implementation, you would:
       * 1. Import the contract ABI
       * 2. Create a contract instance
       * 3. Call the withdraw() function directly
       * 
       * Example with proper contract interaction:
       * const contract = new ethers.Contract(contractAddress, abi, signer);
       * const tx = await contract.withdraw();
       * 
       * The '0x3ccfd60b' is the function selector for withdraw()
       * calculated as the first 4 bytes of keccak256("withdraw()")
       */
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: '0x3ccfd60b', // withdraw() function selector
        gasLimit: 100000,   // Set gas limit to prevent out-of-gas errors
      });

      /**
       * WAIT FOR CONFIRMATION
       * 
       * Wait for the transaction to be mined and confirmed on the blockchain.
       * This ensures the withdrawal actually completed before updating UI.
       */
      await tx.wait();
      
      /**
       * POST-WITHDRAWAL UPDATES
       * 
       * After successful withdrawal:
       * 1. Update the owner's ETH balance (they received the tips)
       * 2. Notify parent component with success status and transaction hash
       */
      await updateBalance(); // Refresh owner's balance
      
      // Notify parent component about successful withdrawal
      if (onWithdraw) {
        onWithdraw(true, tx.hash);
      }

    } catch (err: unknown) {
      /**
       * ERROR HANDLING
       * 
       * Withdrawal can fail for several reasons:
       * - User rejected transaction in MetaMask
       * - Insufficient gas fees
       * - Contract function reverted (e.g., not owner, no funds)
       * - Network connectivity issues
       * - Contract doesn't exist or has no withdraw function
       */
      console.error('Error withdrawing funds:', err);
      
      // TypeScript-safe error message extraction
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw funds';
      setError(errorMessage);
      
      // Notify parent component about failed withdrawal
      if (onWithdraw) {
        onWithdraw(false);
      }
    } finally {
      setIsLoading(false); // Hide loading spinner regardless of outcome
    }
  };

  /**
   * HYDRATION SAFETY CHECK
   * 
   * Prevents React hydration mismatches between server and client.
   * Shows loading state until we're sure we're on the client side.
   */
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30"></div>
          <p className="text-gray-400 font-rajdhani">Loading withdrawal...</p>
        </div>
      </div>
    );
  }

  /**
   * WALLET NOT CONNECTED STATE
   * 
   * Shows disabled state when no wallet is connected.
   * Uses reduced opacity to indicate unavailable functionality.
   */
  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 
                      flex items-center justify-center opacity-50">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>
        <h3 className="text-lg font-orbitron font-bold text-gray-400 mb-2">Wallet Required</h3>
        <p className="text-gray-500 font-rajdhani">Connect your wallet to access withdrawal</p>
      </div>
    );
  }

  /**
   * NON-OWNER STATE
   * 
   * Shows locked state when connected wallet is not the contract owner.
   * This provides clear feedback about why withdrawal is not available.
   * Uses lock icon and grayed-out styling to indicate restricted access.
   */
  if (!isOwner) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 
                        flex items-center justify-center opacity-60">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">Owner Access Only</h3>
          <p className="text-gray-500 font-rajdhani leading-relaxed">
            Only the contract owner can withdraw accumulated tips
          </p>
          
          {/* Owner address display for transparency */}
          {contractOwner && (
            <div className="mt-4 p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <p className="text-xs text-gray-400 font-rajdhani mb-1">CONTRACT OWNER</p>
              <p className="text-sm font-orbitron text-gray-300 break-all">
                {contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * OWNER WITHDRAWAL UI
   * 
   * The active withdrawal interface when the connected wallet is the contract owner.
   * Includes withdrawal button, error display, and informational text.
   * Uses green color scheme to indicate positive/success action.
   */
  return (
    <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 animate-pulse"></div>
      
      <div className="relative z-10">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            {/* Enhanced icon with double glow effect */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 
                            flex items-center justify-center glow-green">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping"></div>
            </div>
            
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-1">Withdraw Tips</h2>
              <p className="text-gray-300 font-rajdhani">Transfer all accumulated tips to your wallet</p>
            </div>
          </div>

          {/* Owner verification badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-xs text-green-300 font-rajdhani font-medium">✓ VERIFIED OWNER</span>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-300 font-rajdhani">{error}</p>
            </div>
          </div>
        )}

        {/* Main withdrawal button */}
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full py-5 px-8 bg-gradient-to-r from-green-500 to-emerald-500 
                   hover:from-green-600 hover:to-emerald-600 rounded-2xl text-white font-orbitron 
                   font-bold text-lg transition-all duration-300 transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   border border-green-400/50 glow-green hover:glow-emerald shadow-2xl
                   active:scale-95"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing Withdrawal...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Withdraw All Tips</span>
            </div>
          )}
        </button>

        {/* Informational footer */}
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-green-300 font-rajdhani font-medium mb-1">
                Secure Withdrawal Process
              </p>
              <p className="text-xs text-green-300/80 font-rajdhani leading-relaxed">
                This action will transfer all ETH from the tip jar contract to your wallet. 
                Transaction fees will apply for the blockchain operation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 