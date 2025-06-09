# TipJar dApp Frontend Setup

## 🚀 Project Overview

This TipJar dApp is a complete Web3 application built with Next.js 15, featuring a futuristic cyberpunk design with full blockchain integration. Users can connect their MetaMask wallet, send ETH tips with optional messages, and owners can withdraw accumulated funds.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4 with custom neon effects
- **Web3**: Ethers.js v6 for blockchain interaction
- **Wallet**: MetaMask integration
- **Fonts**: Orbitron (headers) + Rajdhani (body) via next/font/google

## 🎨 Design Features

- **Dark Mode**: Deep black/navy background (#0a0a0a) with neon accents
- **Glass Morphism**: Semi-transparent cards with backdrop blur effects
- **Neon Colors**: Blue (#00d4ff), Green (#39ff14), Purple (#bf00ff)
- **Animations**: Pulsing borders, glowing effects, smooth transitions
- **Responsive**: 3-column desktop → 2-column tablet → 1-column mobile

## 🔄 Application Flow

### 1. Initial Load & Wallet Detection
```
User visits app → Check if MetaMask installed → Silent wallet check (eth_accounts) 
→ If connected: Load balance & display wallet info
→ If not connected: Show connect button
```

### 2. Wallet Connection Flow
```
User clicks "Connect Wallet" → MetaMask popup (eth_requestAccounts) 
→ User approves → Get wallet address → Fetch ETH balance 
→ Update UI with connected state → Enable tip functionality
```

### 3. Tip Sending Flow
```
User enters tip amount + optional message → Form validation 
→ Create transaction object → MetaMask confirmation popup 
→ User approves → Transaction sent to blockchain → Wait for confirmation 
→ Update balances → Show success notification → Reset form
```

### 4. Balance Updates
```
Real-time monitoring: User balance + Contract balance 
→ Updates after transactions → USD conversion estimates 
→ Automatic refresh on wallet events
```

### 5. Owner Withdrawal Flow
```
Owner connects wallet → Verify owner address → Show withdraw button 
→ Click withdraw → Contract withdrawal transaction → Funds sent to owner
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local` in root directory:

```env
# Your deployed smart contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b

# The contract owner's address (who can withdraw funds)
NEXT_PUBLIC_CONTRACT_OWNER=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b

# Ethereum RPC URL (Infura, Alchemy, etc.)
NEXT_PUBLIC_INFURA_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

## 🧩 Component Architecture

### Core Hook: `useWallet` (`src/hooks/useWallet.ts`)
**Purpose**: Centralized wallet state management
**Key Functions**:
- `connectWallet()`: Triggers MetaMask connection popup
- `checkIfWalletIsConnected()`: Silent connection check on load
- `updateBalance()`: Refreshes ETH balance from blockchain
- `disconnectWallet()`: Resets app state (doesn't disconnect MetaMask)

**State Management**:
```typescript
interface WalletState {
  address: string | null;    // User's wallet address
  isConnected: boolean;      // Connection status
  balance: string;           // ETH balance as formatted string
  isLoading: boolean;        // Loading state for async operations
}
```

**Event Listeners**:
- `accountsChanged`: Handles account switching in MetaMask
- `chainChanged`: Handles network switching (Ethereum, Polygon, etc.)

### Component: `ConnectWallet` (`src/components/ConnectWallet.tsx`)
**Purpose**: Wallet connection interface
**States**: Loading → Connected (shows address) → Disconnected
**Features**: 
- Formatted address display (0x1234...abcd)
- MetaMask installation detection
- Error handling with user feedback

### Component: `BalanceDisplay` (`src/components/BalanceDisplay.tsx`)
**Purpose**: Real-time balance monitoring
**Displays**:
- User's ETH balance with USD estimate
- Contract's total tip balance
- Auto-refresh after transactions
**Layout**: Responsive grid with color-coded cards (blue/green)

### Component: `TipForm` (`src/components/TipForm.tsx`)
**Purpose**: Complete tip-sending workflow
**Process**:
1. **Validation**: Wallet connected + valid amount
2. **Transaction Creation**:
   ```typescript
   const transaction = {
     to: contractAddress,
     value: ethers.parseEther(amount),  // Convert ETH to Wei
     data: message ? ethers.hexlify(ethers.toUtf8Bytes(message)) : '0x'
   };
   ```
3. **Blockchain Interaction**: Send transaction → Wait for confirmation
4. **Post-Transaction**: Update balances → Reset form → Notify user

**Features**:
- Quick amount buttons (0.001, 0.01, 0.1, 1.0 ETH)
- Optional message field (encoded as hex bytes)
- Loading states during transaction processing
- Comprehensive error handling

### Component: `Notification` (`src/components/Notification.tsx`)
**Purpose**: User feedback system
**Types**: Success (green), Error (red), Warning (yellow), Info (blue)
**Behavior**: Auto-dismiss after 5 seconds, manual close option
**Positioning**: Fixed top-right with slide-in animation

### Component: `WithdrawButton` (`src/components/WithdrawButton.tsx`)
**Purpose**: Owner-only fund withdrawal
**Access Control**: Only shows for contract owner address
**Process**: Verify ownership → Call contract withdraw function → Transfer all funds

## 🔗 Smart Contract Integration

### Expected Contract Interface
```solidity
contract TipJar {
    address public owner;
    
    function tip(string memory message) external payable {
        // Accept ETH tips with optional message
        emit TipReceived(msg.sender, msg.value, message);
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
        emit Withdrawal(owner, address(this).balance);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
```

### Transaction Types
1. **Tip Transaction**: `{ to: contractAddress, value: tipAmount, data: messageHex }`
2. **Withdrawal**: Contract function call to transfer all funds to owner

## 🔒 Security & Error Handling

### Wallet Security
- Never store private keys
- Validate all contract addresses
- Use testnet for development
- Implement proper access controls

### Error Scenarios Handled
- MetaMask not installed
- User rejects transaction
- Insufficient funds for gas
- Network connectivity issues
- Invalid contract addresses
- Transaction failures

### SSR/Hydration Safety
- `isClient` flag prevents server-side Web3 calls
- `suppressHydrationWarning` on body element
- Proper event listener cleanup

## 🎯 Key Features

✅ **Wallet Integration**: MetaMask connection with event listeners  
✅ **Real-time Updates**: Balance monitoring and transaction status  
✅ **Tip Functionality**: ETH sending with optional messages  
✅ **Owner Controls**: Withdrawal functionality with access control  
✅ **Notifications**: Toast system for user feedback  
✅ **Responsive Design**: Mobile-first with glass morphism  
✅ **Type Safety**: Full TypeScript implementation  
✅ **Error Handling**: Comprehensive error management  
✅ **Loading States**: User feedback during async operations  
✅ **Form Validation**: Input validation and sanitization  

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables for Production
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract
- `NEXT_PUBLIC_CONTRACT_OWNER`: Owner's wallet address  
- `NEXT_PUBLIC_INFURA_URL`: Production RPC endpoint

## 🔧 Customization

### Color Scheme
Update CSS variables in `src/app/globals.css`:
```css
:root {
  --neon-blue: #00d4ff;
  --neon-green: #39ff14;
  --electric-purple: #bf00ff;
}
```

### Adding Components
1. Create in `src/components/`
2. Add TypeScript interfaces in `src/types/`
3. Import in `src/app/page.tsx`
4. Follow existing patterns for Web3 integration

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

## 🎉 Development Notes

- Uses Turbopack for faster development builds
- ESLint configured for Next.js and TypeScript
- CSS organized with Tailwind layers (@layer base, components, utilities)
- Font optimization with next/font/google
- Proper TypeScript interfaces for all Web3 interactions

This TipJar dApp demonstrates modern Web3 development practices with a focus on user experience, security, and maintainable code architecture. 🚀✨ 