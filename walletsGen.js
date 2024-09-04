const fs = require("fs");
const { ethers, JsonRpcProvider } = require("ethers");

function generateWallets(walletCount = 100, fileName = "wallets.txt") {
    const wallets = [];
  
    // Generate wallets and store them in an array
    for (let i = 0; i < walletCount; i++) {
      const wallet = ethers.Wallet.createRandom();
      wallets.push({
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        address: wallet.address,
      });
    }
  
    // Save the private and public keys to a text file
    const data = wallets
      .map(
        (wallet, index) =>
          `Wallet ${index + 1}:\nPrivate Key: ${wallet.privateKey}\nPublic Key: ${wallet.publicKey}\nAddress: ${wallet.address}\n`
      )
      .join("\n");
  
    fs.writeFileSync(fileName, data);
  
    console.log(`${walletCount} wallets generated and saved to ${fileName}`);
  
    return wallets; // Return the wallets array for later use
  }

  generateWallets();