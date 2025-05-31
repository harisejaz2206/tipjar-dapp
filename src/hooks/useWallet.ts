'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, EthereumWindow } from '@/types';

declare let window: EthereumWindow;

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: '0',
    isLoading: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!isClient || typeof window === 'undefined' || !window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      }) as string[];

      if (accounts.length > 0) {
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        
        setWalletState({
          address,
          isConnected: true,
          balance: ethers.formatEther(balance),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, [isClient]);

  const connectWallet = async () => {
    try {
      if (!isClient || typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      setWalletState(prev => ({ ...prev, isLoading: true }));

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const address = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);

      setWalletState({
        address,
        isConnected: true,
        balance: ethers.formatEther(balance),
        isLoading: false,
      });

      return address;
    } catch (error) {
      setWalletState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      balance: '0',
      isLoading: false,
    });
  };

  const updateBalance = async () => {
    if (!isClient || !walletState.address || typeof window === 'undefined' || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletState.address);
      
      setWalletState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  useEffect(() => {
    if (!isClient) return;
    
    checkIfWalletIsConnected();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkIfWalletIsConnected();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkIfWalletIsConnected, isClient]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateBalance,
    isClient,
  };
}; 