# Decentralized Freelance Platform

A trustless freelance marketplace where freelancers can offer services and clients can hire them with secure escrow payment.

## Features

- Freelancers can list services with title and price
- Clients can hire freelancers and escrow payments
- Smart contracts automatically handle payment releases and refunds
- Secure and trustless transactions
- User-friendly React interface

## Prerequisites

- Node.js and npm
- Truffle
- Ganache (for local blockchain)
- MetaMask (or similar wallet extension)

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd decentralized-freelance-platform
```

2. Install dependencies:
```
npm install
```

3. Install Truffle globally (if not already installed):
```
npm install -g truffle
```

4. Start Ganache:
   - Open Ganache and start a workspace

5. Compile and migrate the contracts:
```
truffle compile
truffle migrate
```

6. Start the React development server:
```
npm start
```

7. Configure MetaMask:
   - Connect MetaMask to your local Ganache blockchain (usually http://localhost:7545)
   - Import accounts from Ganache by using the private keys

## Usage

### For Freelancers:
1. Make sure you're in "Freelancer Mode" (toggle in the navbar)
2. Click "Offer Service" in the navigation
3. Fill out the service form with title and price
4. Submit the form to create your service listing

### For Clients:
1. Switch to "Client Mode" (toggle in the navbar)
2. Browse available services in the Marketplace
3. Click "Hire Freelancer" on a service to hire and pay
4. Check "My Hired Services" to manage your hired services
5. Release payment when work is complete or request a refund if needed

## Testing

Run the test suite with:
```
truffle test
```

## Smart Contract Structure

The `FreelanceMarketplace` contract has the following main functions:

- `offerService`: Allows freelancers to list services
- `hireFreelancer`: Allows clients to hire and escrow funds
- `releasePayment`: Allows clients to release payment to freelancer
- `refundClient`: Allows clients to request refunds

## Security Considerations

- All payment functions are protected with `nonReentrant` modifier
- Access control ensures only authorized users can perform actions
- Funds are securely held in escrow until explicitly released
