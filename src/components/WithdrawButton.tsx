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
        <p className="text-gray-400 font-rajdhani">Loading withdrawal...</p>
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
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center opacity-50">
        <p className="text-gray-500 font-rajdhani">Connect wallet to access withdrawal</p>
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
      <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl text-center">
        {/* Lock icon to indicate restricted access */}
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

  /**
   * OWNER WITHDRAWAL UI
   * 
   * The active withdrawal interface when the connected wallet is the contract owner.
   * Includes withdrawal button, error display, and informational text.
   * Uses green color scheme to indicate positive/success action.
   */
  return (
    <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
      {/* Header Section with Icon and Title */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          {/* Green checkmark icon with glow effect */}
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

      {/* ERROR DISPLAY SECTION */}
      {/* Only shows when there's an error to display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 font-rajdhani">{error}</p>
        </div>
      )}

      {/* WITHDRAWAL BUTTON */}
      <button
        onClick={handleWithdraw}
        disabled={isLoading} // Disable during withdrawal process
        className="w-full py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-500 
                 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-orbitron 
                 font-bold text-lg transition-all duration-300 transform hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                 border border-green-400/50 glow-green hover:glow-emerald"
      >
        {isLoading ? (
          // Loading state: spinner animation + text
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing Withdrawal...</span>
          </div>
        ) : (
          // Normal state: withdrawal action text
          'Withdraw All Tips'
        )}
      </button>

      {/* INFORMATIONAL FOOTER */}
      {/* Explains the withdrawal functionality and security */}
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-sm text-green-300 font-rajdhani">
          🔒 As the contract owner, you can withdraw all accumulated tips to your wallet.
          This action will transfer all ETH from the contract to your address.
        </p>
      </div>
    </div>
  );
} 