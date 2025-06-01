'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, EthereumWindow } from '@/types';

// TypeScript declaration to tell the compiler that window has ethereum property
// This extends the global Window interface to include MetaMask's ethereum object
declare let window: EthereumWindow;

/**
 * useWallet Custom Hook
 * 
 * This hook encapsulates ALL wallet-related logic:
 * - Connection state management
 * - MetaMask integration
 * - Balance tracking
 * - Event listeners for wallet changes
 * - SSR/hydration safety
 */
export const useWallet = () => {
  /**
   * MAIN WALLET STATE
   * 
   * This object holds all the wallet information our app needs:
   * - address: The user's wallet address (0x...)
   * - isConnected: Boolean flag for connection status
   * - balance: ETH balance as a string
   * - isLoading: Loading state for async operations
   */
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: '0',
    isLoading: false,
  });

  /**
   * CLIENT-SIDE RENDERING FLAG
   * 
   * This prevents hydration mismatches between server and client.
   * Server doesn't have access to window.ethereum, but client does.
   * We only run Web3 code after confirming we're on the client.
   */
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * CHECK IF WALLET IS ALREADY CONNECTED
   * 
   * This function checks if MetaMask is already connected without
   * prompting the user. Uses eth_accounts (silent) vs eth_requestAccounts (popup).
   * 
   * useCallback prevents unnecessary re-renders and dependency loops.
   */
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      // Safety checks: ensure we're on client and MetaMask exists
      if (!isClient || typeof window === 'undefined' || !window.ethereum) return;

      // eth_accounts returns connected accounts WITHOUT showing popup
      // This is different from eth_requestAccounts which shows the connection popup
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      }) as string[];

      // If accounts exist, user is already connected
      if (accounts.length > 0) {
        const address = accounts[0]; // Use the first account
        
        // Create ethers provider to interact with blockchain
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get the current ETH balance for this address
        const balance = await provider.getBalance(address);
        
        // Update our state with the connected wallet info
        setWalletState({
          address,
          isConnected: true,
          balance: ethers.formatEther(balance), // Convert from Wei to ETH
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      // Don't throw here - this is a silent check
    }
  }, [isClient]); // Only re-create if isClient changes

  /**
   * CONNECT WALLET FUNCTION
   * 
   * This actively prompts the user to connect their MetaMask wallet.
   * Shows the MetaMask popup for account selection and permission.
   */
  const connectWallet = async () => {
    try {
      // Safety check: ensure MetaMask is available
      if (!isClient || typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Set loading state to show spinner in UI
      setWalletState(prev => ({ ...prev, isLoading: true }));

      // eth_requestAccounts WILL show the MetaMask popup
      // This is the key difference from eth_accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const address = accounts[0];
      
      // Create provider and get balance (same as checkIfWalletIsConnected)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);

      // Update state with successful connection
      setWalletState({
        address,
        isConnected: true,
        balance: ethers.formatEther(balance),
        isLoading: false,
      });

      return address; // Return address for any component that needs it
    } catch (error) {
      // Reset loading state on error
      setWalletState(prev => ({ ...prev, isLoading: false }));
      throw error; // Re-throw so component can handle the error
    }
  };

  /**
   * DISCONNECT WALLET FUNCTION
   * 
   * Note: We can't actually "disconnect" from MetaMask programmatically.
   * This just resets our app's state to act as if disconnected.
   * User would need to disconnect manually in MetaMask extension.
   */
  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      balance: '0',
      isLoading: false,
    });
  };

  /**
   * UPDATE BALANCE FUNCTION
   * 
   * Refreshes the user's ETH balance from the blockchain.
   * Called after transactions to show updated balance.
   */
  const updateBalance = async () => {
    // Safety checks: need client, address, and MetaMask
    if (!isClient || !walletState.address || typeof window === 'undefined' || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletState.address);
      
      // Update only the balance, keep other state the same
      setWalletState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    } catch (error) {
      console.error('Error updating balance:', error);
      // Don't throw - this is often called automatically
    }
  };

  /**
   * METAMASK EVENT LISTENERS
   * 
   * This effect sets up listeners for MetaMask events:
   * - accountsChanged: User switches accounts in MetaMask
   * - chainChanged: User switches networks (Ethereum, Polygon, etc.)
   */
  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    // Check for existing connection when hook first loads
    checkIfWalletIsConnected();

    // Set up event listeners if MetaMask is available
    if (typeof window !== 'undefined' && window.ethereum) {
      
      /**
       * ACCOUNTS CHANGED LISTENER
       * 
       * Fires when user:
       * - Switches accounts in MetaMask
       * - Disconnects all accounts
       * - Connects new accounts
       */
      window.ethereum.on('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          // No accounts = user disconnected
          disconnectWallet();
        } else {
          // New account selected = re-check connection
          checkIfWalletIsConnected();
        }
      });

      /**
       * CHAIN CHANGED LISTENER
       * 
       * Fires when user switches networks (Ethereum mainnet, testnet, etc.)
       * We reload the page because network changes can break contract connections.
       */
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    /**
     * CLEANUP FUNCTION
     * 
     * Remove event listeners when component unmounts
     * Prevents memory leaks and duplicate listeners
     */
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkIfWalletIsConnected, isClient]); // Re-run if these dependencies change

  /**
   * RETURN OBJECT
   * 
   * Spread the walletState to expose individual properties,
   * plus our functions for components to use.
   */
  return {
    ...walletState,        // address, isConnected, balance, isLoading
    connectWallet,         // Function to connect wallet
    disconnectWallet,      // Function to disconnect wallet  
    updateBalance,         // Function to refresh balance
    isClient,             // Flag for SSR safety
  };
}; 