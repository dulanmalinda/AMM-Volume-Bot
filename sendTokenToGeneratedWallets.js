require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const privateKey = process.env.USER_PRIVATE_KEY; 
const tokenAddress = process.env.TARGET_TOKEN; 
const meldAddress = process.env.MELD; 
const tokenABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_wad",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const providerURL = process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(providerURL);
const wallet = new ethers.Wallet(privateKey, provider);
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);
const meldContract = new ethers.Contract(meldAddress, tokenABI, wallet);

const filePath = './wallets.txt';
const recipientData = fs.readFileSync(filePath, 'utf-8').split('\n').filter(line => line.includes('Address:'));
const tokenAmount = ethers.parseUnits("50", 18);
const meldAmount = ethers.parseUnits("50", 18);
const nativeAmount = ethers.parseEther("0.1");

async function sendTokensAndNative() {
    let nonce = await wallet.getNonce();

    for (let data of recipientData) {
        const recipientAddress = data.split('Address: ')[1].trim();
        try {
            // Get updated gas price
            const gasPrice = (await provider.getFeeData()).gasPrice;
            const increasedGasPrice = gasPrice * 2n;  // Increase the gas price to expedite transactions

            // Sending token
            const tokenTx = await tokenContract.transfer(recipientAddress, tokenAmount, { gasPrice: increasedGasPrice, nonce: nonce++ });
            console.log(`Token transaction hash for recipient ${recipientAddress}:`, tokenTx.hash);
            await tokenTx.wait();

            // Sending Meld
            const meldTx = await meldContract.transfer(recipientAddress, meldAmount, { gasPrice: increasedGasPrice, nonce: nonce++ });
            console.log(`Meld transaction hash for recipient ${recipientAddress}:`, meldTx.hash);
            await meldTx.wait();
            
            // Sending native currency
            const nativeTx = await wallet.sendTransaction({
                to: recipientAddress,
                value: nativeAmount,
                gasPrice: increasedGasPrice,
                nonce: nonce++
            });
            console.log(`Native currency transaction hash for recipient ${recipientAddress}:`, nativeTx.hash);
            await nativeTx.wait();

        } catch (error) {
            console.error(`Error sending assets to ${recipientAddress}:`, error);
            nonce--;  // Adjust nonce back if transaction failed
        }
    }
}

sendTokensAndNative();
