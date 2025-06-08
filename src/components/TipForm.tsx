'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { TipTransaction, EthereumWindow } from '@/types';

// TypeScript declaration to tell the compiler that window has ethereum property
// This extends the global Window interface to include MetaMask's ethereum object
declare let window: EthereumWindow;

/**
 * Props interface for TipForm component
 * 
 * contractAddress: The deployed smart contract address to send tips to
 * onTipSent: Optional callback function to notify parent about tip transactions
 */
interface TipFormProps {
  contractAddress?: string;
  onTipSent?: (transaction: TipTransaction) => void;
}

/**
 * TipForm Component
 * 
 * This component handles the entire tip-sending process:
 * 1. Form validation (amount, wallet connection)
 * 2. Creating and sending blockchain transactions
 * 3. Waiting for transaction confirmation
 * 4. Updating balances after successful tips
 * 5. Providing user feedback throughout the process
 * 
 * Features:
 * - ETH amount input with validation
 * - Optional message field
 * - Quick amount buttons for common tip values
 * - Loading states during transaction processing
 * - Error handling and user feedback
 * - Automatic form reset after successful tips
 */
export default function TipForm({ contractAddress, onTipSent }: TipFormProps) {
  // Get wallet state and functions from our custom hook
  // This hook manages all the Web3 wallet logic
  const { isConnected, updateBalance, isClient } = useWallet();
  
  // Form state management
  const [amount, setAmount] = useState('');           // ETH amount to tip
  const [message, setMessage] = useState('');         // Optional message to include with tip
  const [isLoading, setIsLoading] = useState(false);  // Transaction in progress flag
  const [error, setError] = useState<string | null>(null); // Error messages for user feedback

  /**
   * MAIN FORM SUBMISSION HANDLER
   * 
   * This function orchestrates the entire tip-sending process:
   * 1. Validates inputs and wallet connection
   * 2. Creates and sends the blockchain transaction
   * 3. Waits for confirmation
   * 4. Updates UI and balances
   * 5. Handles errors gracefully
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    /**
     * VALIDATION CHECKS
     * 
     * Before attempting any blockchain operations, we validate:
     * - Wallet is connected to the dApp
     * - Contract address is provided by parent component
     * - MetaMask is available in the browser
     * - Amount is valid and positive
     */
    if (!isConnected || !contractAddress || typeof window === 'undefined' || !window.ethereum) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid tip amount');
      return;
    }

    try {
      setIsLoading(true);  // Show loading spinner in UI
      setError(null);      // Clear any previous error messages

      /**
       * WEB3 TRANSACTION SETUP
       * 
       * Create provider and signer for blockchain interaction:
       * - Provider: Read-only connection to blockchain (can query data)
       * - Signer: Can sign and send transactions (connected to user's wallet)
       */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      /**
       * TRANSACTION OBJECT CREATION
       * 
       * This creates a raw Ethereum transaction:
       * - to: Recipient address (our smart contract address)
       * - value: Amount of ETH to send (converted from ETH to Wei - smallest unit)
       * - data: Optional message encoded as hex bytes for blockchain storage
       */
      const transaction = {
        to: contractAddress,
        value: ethers.parseEther(amount), // Convert ETH to Wei (1 ETH = 10^18 Wei)
        data: message ? ethers.hexlify(ethers.toUtf8Bytes(message)) : '0x', // Encode message as hex
      };

      /**
       * SEND TRANSACTION TO BLOCKCHAIN
       * 
       * This triggers MetaMask popup for user confirmation.
       * User sees gas fees and can approve/reject the transaction.
       * Returns immediately with transaction hash, doesn't wait for mining.
       */
      const tx = await signer.sendTransaction(transaction);
      
      /**
       * CREATE TRANSACTION RECORD
       * 
       * We create a transaction object to track the tip's status
       * and notify parent components about the transaction progress.
       */
      const tipTransaction: TipTransaction = {
        amount,
        message,
        hash: tx.hash,    // Blockchain transaction hash for tracking
        status: 'pending', // Initial status - transaction sent but not confirmed
      };

      // Notify parent component about pending transaction (for notifications/UI updates)
      if (onTipSent) {
        onTipSent(tipTransaction);
      }

      /**
       * WAIT FOR BLOCKCHAIN CONFIRMATION
       * 
       * tx.wait() waits for the transaction to be mined and confirmed on blockchain.
       * This can take 15 seconds to several minutes depending on:
       * - Network congestion
       * - Gas price paid
       * - Blockchain being used (Ethereum mainnet vs testnets)
       */
      await tx.wait();
      
      /**
       * POST-TRANSACTION CLEANUP
       * 
       * After successful confirmation:
       * 1. Update user's balance (they spent ETH on the tip + gas fees)
       * 2. Reset the form fields for next tip
       * 3. Notify parent about successful transaction
       */
      await updateBalance(); // Refresh user's ETH balance
      
      // Reset form fields to empty state
      setAmount('');
      setMessage('');
      
      // Notify parent about successful transaction (for success notifications)
      if (onTipSent) {
        onTipSent({ ...tipTransaction, status: 'success' });
      }

    } catch (err: unknown) {
      /**
       * ERROR HANDLING
       * 
       * Blockchain transactions can fail for many reasons:
       * - User rejected transaction in MetaMask popup
       * - Insufficient funds for gas fees
       * - Network congestion or RPC errors
       * - Invalid transaction data
       * - Contract execution failures
       */
      console.error('Error sending tip:', err);
      
      // TypeScript-safe error message extraction
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tip';
      setError(errorMessage);
      
      // Notify parent about failed transaction (for error notifications)
      if (onTipSent) {
        onTipSent({
          amount,
          message,
          status: 'error',
        });
      }
    } finally {
      setIsLoading(false); // Hide loading spinner regardless of success/failure
    }
  };

  /**
   * QUICK AMOUNT BUTTONS
   * 
   * Predefined amounts for common tip values in ETH.
   * Makes it easier for users to select standard amounts without typing.
   * Values chosen to represent different tip levels:
   * - 0.001 ETH: Small tip (~$2 at $2000/ETH)
   * - 0.01 ETH: Medium tip (~$20)
   * - 0.1 ETH: Large tip (~$200)
   * - 1.0 ETH: Very large tip (~$2000)
   */
  const quickAmounts = ['0.001', '0.01', '0.1', '1.0'];

  /**
   * HYDRATION SAFETY CHECK
   * 
   * Prevents React hydration mismatches between server and client.
   * Server doesn't have access to window.ethereum, but client does.
   * We show a loading state until we're sure we're on the client side.
   */
  if (!isClient) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
        <p className="text-gray-400 font-rajdhani">Loading tip form...</p>
      </div>
    );
  }

  /**
   * WALLET NOT CONNECTED STATE
   * 
   * Shows disabled form with message to connect wallet.
   * Prevents users from trying to tip without wallet connection.
   * Uses grayed-out styling to indicate disabled state.
   */
  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl text-center">
        {/* Grayed out Ethereum icon to indicate disabled state */}
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

  /**
   * MAIN FORM UI
   * 
   * The active form when wallet is connected and ready to send tips.
   * Includes all input fields, validation, and submission logic.
   * Uses glass morphism design with cyberpunk neon accents.
   */
  return (
    <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-xl">
      {/* Header Section with Icon and Title */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          {/* Purple/pink gradient icon with glow effect */}
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
        
        {/* AMOUNT INPUT SECTION */}
        <div>
          <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
            Tip Amount (ETH)
          </label>
          <div className="relative">
            {/* Main amount input field with number validation */}
            <input
              type="number"
              step="0.001"        // Allow 3 decimal places for precision
              min="0"             // Prevent negative amounts
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl 
                       text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-400/20 transition-all duration-300
                       font-orbitron text-lg"
            />
            {/* ETH label positioned inside the input field */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-blue-400 font-orbitron font-bold">ETH</span>
            </div>
          </div>
          
          {/* Quick Amount Selection Buttons */}
          <div className="flex space-x-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"  // Prevent form submission when clicked
                onClick={() => setAmount(quickAmount)} // Set amount directly
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 
                         rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-300
                         font-rajdhani"
              >
                {quickAmount} ETH
              </button>
            ))}
          </div>
        </div>

        {/* MESSAGE INPUT SECTION */}
        <div>
          <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
            Message (Optional)
          </label>
          {/* Textarea for optional message to include with tip */}
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

        {/* ERROR DISPLAY SECTION */}
        {/* Only shows when there's an error to display */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 font-rajdhani">{error}</p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isLoading || !amount} // Disable if loading or no amount entered
          className="w-full py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 
                   hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-orbitron 
                   font-bold text-lg transition-all duration-300 transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   border border-purple-400/50 glow-purple hover:glow-pink"
        >
          {isLoading ? (
            // Loading state: spinner animation + text
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending Tip...</span>
            </div>
          ) : (
            // Normal state: dynamic text showing current amount
            `Send ${amount || '0'} ETH Tip`
          )}
        </button>
      </form>

      {/* INFORMATIONAL FOOTER */}
      {/* Explains what happens when user sends a tip */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300 font-rajdhani">
          💡 Your tip will be sent directly to the smart contract on the Ethereum blockchain.
          Transaction fees (gas) will apply.
        </p>
      </div>
    </div>
  );
} 