export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string;
  isLoading: boolean;
}

export interface ContractState {
  balance: string;
  owner: string | null;
  isLoading: boolean;
}

export interface TipTransaction {
  amount: string;
  message: string;
  hash?: string;
  status: 'pending' | 'success' | 'error';
}

export interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeAllListeners: (event: string) => void;
    isMetaMask?: boolean;
  };
} 