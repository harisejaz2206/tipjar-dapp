# **Tip Jar dApp Frontend Documentation**

## **Project Overview**

**TipJar** is a decentralized application (dApp) built on the Ethereum blockchain, designed to allow users to send tips (ETH) to the contract owner. The app includes features such as:

* **MetaMask Wallet Integration**: Users can connect their wallet and interact with the dApp.
* **Smart Contract Interaction**: Users can send ETH as a tip, and the contract owner can withdraw accumulated ETH.
* **Simple UI**: The user interface consists of easy-to-use components for tipping, viewing balances, and withdrawing funds.

The dApp helps users understand core blockchain concepts, including interacting with smart contracts, handling transactions, and using MetaMask for wallet authentication.

---

## **Frontend Tech Stack**

The frontend is built with the following technologies:

* **React** (via **Next.js** for server-side rendering)
* **TypeScript** for type safety and scalability
* **Ethers.js** to interact with the Ethereum blockchain
* **MetaMask** for wallet integration
* **Tailwind CSS** for UI styling

---

## **Setting Up the Frontend**

### 1. **Install Dependencies**

After cloning the repository, install all necessary dependencies by running:

```bash
npm install
```

This will install the required packages for React, TypeScript, Ethers.js, and Tailwind CSS.

### 2. **Configure Environment Variables**

Create a `.env.local` file in the root of your project and add the following environment variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract_address>
NEXT_PUBLIC_INFURA_URL=<your_infura_or_alchemy_rpc_url>
```

* **NEXT\_PUBLIC\_CONTRACT\_ADDRESS**: The address of your deployed Ethereum smart contract.
* **NEXT\_PUBLIC\_INFURA\_URL**: The RPC URL for connecting to the Ethereum network (provided by services like Infura or Alchemy).

### 3. **Run the Development Server**

Start the development server using:

```bash
npm run dev
```

This will run the application locally at `http://localhost:3000`.

---

## **Frontend Components Overview**

The frontend consists of the following core components, each responsible for a specific part of the user experience:

### 1. **ConnectWallet**

* **Purpose**: This component connects the user's MetaMask wallet to the dApp. It checks if MetaMask is installed, requests wallet access, and updates the UI with the user's Ethereum address.
* **Core Functions**:

  * Display a "Connect Wallet" button when the user is not connected.
  * Show the connected wallet's Ethereum address once connected.
  * Trigger the MetaMask connection process when clicked.

### 2. **BalanceDisplay**

* **Purpose**: This component displays both the user's Ethereum balance and the balance of the smart contract (i.e., the total tips collected).
* **Core Functions**:

  * Retrieve and display the user's ETH balance using the MetaMask wallet.
  * Fetch and display the balance of the contract using the contract's address.
  * Update balances in real-time after a tip is made or a withdrawal is executed.

### 3. **TipForm**

* **Purpose**: The TipForm allows users to send ETH as a tip to the smart contract. It includes an input field for the tip amount and an optional message.
* **Core Functions**:

  * Accepts ETH input from the user (ensuring it's a valid amount).
  * Allows the user to optionally include a message with the tip.
  * Calls the smart contract’s `tip` function to send the transaction on the blockchain.
  * Displays transaction status (pending, success, or error).

### 4. **WithdrawButton**

* **Purpose**: This button allows the contract owner to withdraw the accumulated ETH from the contract.
* **Core Functions**:

  * Ensures that only the contract owner can withdraw funds by checking the user’s address against the contract owner’s address.
  * Calls the contract’s `withdraw` function to transfer the accumulated ETH to the contract owner.
  * Updates the UI to reflect the withdrawal status.

### 5. **Notification**

* **Purpose**: This component displays notifications to the user, such as success messages after a successful transaction or errors if something goes wrong.
* **Core Functions**:

  * Show success or error messages based on user actions (e.g., sending a tip or withdrawing funds).
  * Provide feedback on transactions to enhance the user experience.

---

## **Interaction with MetaMask and Ethereum**

### 1. **Wallet Connection**

The frontend integrates with **MetaMask** to allow users to connect their wallet. MetaMask injects a `window.ethereum` object into the browser, which is used by **Ethers.js** to interact with the Ethereum network. Once the user clicks the "Connect Wallet" button:

* The app requests the user's Ethereum account via `window.ethereum.request({ method: 'eth_requestAccounts' })`.
* After successful connection, the app updates the UI with the connected wallet's address.

### 2. **Reading Blockchain Data**

To display the user's balance and the contract's balance:

* The app uses **Ethers.js** to connect to the Ethereum network via the RPC URL provided by **Infura** or **Alchemy**.
* The user’s balance is fetched using the `getBalance` function from Ethers.js.
* The contract’s balance is retrieved using the contract address and the same `getBalance` method.

### 3. **Sending Transactions**

When a user submits a tip:

* The `TipForm` component sends a transaction to the Ethereum blockchain. It uses **Ethers.js** to interact with the deployed smart contract.
* The transaction is signed by the user’s MetaMask wallet, and once confirmed, the contract balance is updated.
* The transaction status is monitored using **Ethers.js**'s `wait()` method, which waits for the transaction to be confirmed.

### 4. **Smart Contract Interaction**

The app interacts with the Ethereum smart contract using **Ethers.js**:

* A contract instance is created using the contract ABI and address, which are provided in the environment variables.
* Calls are made to the `tip` and `withdraw` functions of the contract, both of which are payable functions.

  * `tip(message, { value: ethers.utils.parseEther(amount) })`: Sends a tip to the contract.
  * `withdraw()`: Allows the contract owner to withdraw the accumulated tips.

---

## **Styling and UI Components**

The frontend is styled using **Tailwind CSS**, a utility-first CSS framework. Tailwind enables responsive and efficient styling without writing custom CSS. Some of the key UI components include:

* **Buttons**: Styled for actions like connecting the wallet, submitting tips, and withdrawing funds.
* **Input fields**: Styled for tip amount and message input.
* **Balances**: Displayed using text components with dynamic classes that change based on the status (e.g., pending transactions or success).

---

## **How to Use the dApp**

1. **Connect Wallet**: When the app loads, click the "Connect Wallet" button to connect your MetaMask wallet.
2. **Send Tips**: Once connected, enter an ETH amount in the TipForm and optionally add a message. Click "Send Tip" to send the tip to the smart contract.
3. **View Balances**: The app shows both your wallet balance and the contract’s balance.
4. **Withdraw Tips**: If you are the contract owner, click the "Withdraw Tips" button to withdraw the accumulated ETH from the contract.

---

## **Conclusion**

The Tip Jar dApp provides a great introduction to full-stack blockchain development. By following this documentation, you will learn how to integrate MetaMask, interact with Ethereum smart contracts using **Ethers.js**, and build a user-friendly frontend with **React** and **Next.js**. This project is a valuable addition to your portfolio, demonstrating your ability to build dApps on Ethereum.
