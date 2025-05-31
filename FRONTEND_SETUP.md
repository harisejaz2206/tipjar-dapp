# TipJar dApp Frontend Setup

## 🚀 Futuristic Blockchain Design

This TipJar dApp features a cutting-edge dark mode design with neon accents and glass morphism effects, perfect for showcasing blockchain technology.

## 🎨 Design Features

- **Dark Mode**: Deep black/navy background with neon blue and green accents
- **Glass Morphism**: Semi-transparent cards with backdrop blur effects
- **Neon Animations**: Pulsing borders and glowing effects
- **Futuristic Fonts**: Orbitron for headers, Rajdhani for body text
- **Responsive Layout**: Works perfectly on desktop and mobile

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

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

Visit `http://localhost:3000` to see your futuristic TipJar dApp!

## 🎯 Components Overview

### ConnectWallet
- Sleek MetaMask integration
- Animated connection states
- Wallet address display with formatting

### BalanceDisplay
- Real-time ETH balance updates
- Contract balance monitoring
- USD conversion estimates

### TipForm
- Intuitive tip amount input
- Quick amount buttons (0.001, 0.01, 0.1, 1.0 ETH)
- Optional message field
- Transaction status feedback

### WithdrawButton
- Owner-only access control
- Secure fund withdrawal
- Transaction confirmation

### Notification
- Toast-style notifications
- Auto-dismiss functionality
- Multiple types (success, error, info, warning)

## 🎨 Design System

### Colors
- **Neon Blue**: `#00d4ff`
- **Neon Green**: `#39ff14`
- **Electric Purple**: `#bf00ff`
- **Dark Background**: `#0a0a0a`

### Typography
- **Headers**: Orbitron (futuristic, tech-inspired)
- **Body**: Rajdhani (clean, readable)

### Effects
- Glass morphism with backdrop blur
- Neon glow animations
- Smooth hover transitions
- Particle background animations

## 🔧 Customization

### Changing Colors
Update the CSS variables in `src/app/globals.css`:

```css
:root {
  --neon-blue: #00d4ff;
  --neon-green: #39ff14;
  --electric-purple: #bf00ff;
}
```

### Adding New Components
1. Create component in `src/components/`
2. Add TypeScript interfaces in `src/types/`
3. Import and use in `src/app/page.tsx`

## 🌐 Web3 Integration

The app uses:
- **Ethers.js** for blockchain interaction
- **MetaMask** for wallet connection
- **React hooks** for state management
- **TypeScript** for type safety

## 📱 Responsive Design

The layout adapts beautifully across devices:
- **Desktop**: 3-column grid layout
- **Tablet**: 2-column responsive grid
- **Mobile**: Single column stack

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Deploy the `out` folder
```

## 🔒 Security Notes

- Always verify contract addresses
- Use testnet for development
- Never commit private keys
- Validate all user inputs

## 🎉 Features

✅ MetaMask wallet integration  
✅ Real-time balance updates  
✅ Tip sending with messages  
✅ Owner withdrawal functionality  
✅ Transaction notifications  
✅ Responsive design  
✅ Dark mode with neon effects  
✅ Glass morphism UI  
✅ Animated backgrounds  
✅ TypeScript support  

Enjoy your futuristic TipJar dApp! 🚀✨ 