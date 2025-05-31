'use client';

import { useState } from 'react';
import ConnectWallet from '@/components/ConnectWallet';
import BalanceDisplay from '@/components/BalanceDisplay';
import TipForm from '@/components/TipForm';
import WithdrawButton from '@/components/WithdrawButton';
import Notification from '@/components/Notification';
import { TipTransaction } from '@/types';

export default function Home() {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false,
  });

  // These would normally come from environment variables
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b';
  const CONTRACT_OWNER = process.env.NEXT_PUBLIC_CONTRACT_OWNER || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b';

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true,
    });
  };

  const handleTipSent = (transaction: TipTransaction) => {
    if (transaction.status === 'pending') {
      showNotification('info', `Tip of ${transaction.amount} ETH is being processed...`);
    } else if (transaction.status === 'success') {
      showNotification('success', `Successfully sent ${transaction.amount} ETH tip! 🎉`);
    } else if (transaction.status === 'error') {
      showNotification('error', 'Failed to send tip. Please try again.');
    }
  };

  const handleWithdraw = (success: boolean, txHash?: string) => {
    if (success) {
      showNotification('success', `Successfully withdrew all tips! 💰${txHash ? ` (${txHash.slice(0, 10)}...)` : ''}`);
    } else {
      showNotification('error', 'Failed to withdraw funds. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
                          flex items-center justify-center glow-blue neon-border">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-orbitron font-black text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TipJar dApp
              </h1>
              <p className="text-xl text-gray-300 font-rajdhani">
                Decentralized Tipping on the Blockchain
              </p>
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-400 font-rajdhani text-lg leading-relaxed">
              Send ETH tips directly on the Ethereum blockchain. Connect your MetaMask wallet 
              and experience the future of decentralized payments.
            </p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <ConnectWallet />
            <WithdrawButton 
              contractAddress={CONTRACT_ADDRESS}
              contractOwner={CONTRACT_OWNER}
              onWithdraw={handleWithdraw}
            />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1 space-y-8">
            <TipForm 
              contractAddress={CONTRACT_ADDRESS}
              onTipSent={handleTipSent}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            <BalanceDisplay 
              contractAddress={CONTRACT_ADDRESS}
            />
            
            {/* Info Card */}
            <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl">
              <h3 className="text-lg font-orbitron font-bold text-white mb-4">How it Works</h3>
              <div className="space-y-3 text-sm text-gray-300 font-rajdhani">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 font-bold text-xs">1</span>
                  </div>
                  <p>Connect your MetaMask wallet to get started</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 font-bold text-xs">2</span>
                  </div>
                  <p>Enter the amount of ETH you want to tip</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 font-bold text-xs">3</span>
                  </div>
                  <p>Your tip is sent directly to the smart contract</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="glass rounded-2xl p-6 border border-white/20 backdrop-blur-xl inline-block">
            <p className="text-gray-400 font-rajdhani">
              Built with ❤️ using Next.js, Ethers.js, and Tailwind CSS
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-rajdhani">Ethereum Network</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-400 font-rajdhani">Web3 Ready</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
