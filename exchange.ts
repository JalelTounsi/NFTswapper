/*
    THE FLOW
    0 - setup constants
    1 - maker creates the order
    2 - maker signs the order
    3 - taker fills the order
    4 - the order is submitted on-chain for settlement
*/

/*
    INSTALLATION
    npm install @traderxyz/nft-swap-sdk
    yarn add @traderxyz/nft-swap-sdk
*/


//CONFIGURATION
import { Web3Provider } from '@etherproject/providers';
import { NftSwapV4 } from '@traderxyz/nft-swap-sdk';

const providerForMaker = new Web3Provider(window.ethereum);
const providerForTaker = new Web3Provider(window.ethereum);
const signerForMaker = providerForMaker.getSigner();
const signerForTaker = providerForTaker.getSigner();
const CHAIN_ID = 1;

// 0 - constants
const NFTCOOLCAT = {
    tokenAddress: '0x1A92...',
    tokenId: '0',
    type: 'ERC721', //  must be one of 'ERC20', 'ERC721', 'ERC1155' 
};

const ONE_THOUSAND_USDC = {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  //USDC contract address
    amount: '1000000000',
    type: 'ERC20',
}

//THE EXCHANGE SOURCE CODE
//  the maker part
//  1 - the maker (NFT Owner) creates the order
//  Initiate SDK fro Maker
const nftSwapSdkMaker = new NftSwapV4(
    providerForMaker, 
    signerForMaker, 
    CHAIN_ID
    );

const WalletAddressMaker = '0x123bA...';
const WalletAddressTaker = '0x987xy...';
//  Approve NFT to trade (if required)
await nftSwapSdkMaker.approveTokenOrNftByAsset(
    NFTCOOLCAT,
    WalletAddressMaker
);

//  build order
const order = nftSwapSdkMaker.buildOrder(
    NFTCOOLCAT,    //  maker asset to swap
    ONE_THOUSAND_USDC,  //  taker asset to swap
    WalletAddressMaker
);

//  2 - maker signs the order
//  the maker signs the order so the order is fillable
const signedOrder = await nftSwapSdkMaker.signOrder(order, WalletAddressTaker);

//  the taker part
// the taker accepts and fills the order from maker to complete the trade
const nftSwapSdkTaker = new NftSwapV4(
    providerForTaker, 
    signerForTaker, 
    CHAIN_ID
    );

//  Approve USDC to trafe (if required)
await nftSwapSdkTaker.approveTokenOrNftByAsset(
    ONE_THOUSAND_USDC,
    WalletAddressTaker
);

//  the taker approves the trade transaction. it's submitted on the blockchain for settlement
const fillTx = await nftSwapSdkTaker.fillSignedOrder(signedOrder);
const fillTxReceipt = await nftSwapSdkTaker.awaitTransactionHash(fillTx.hash);
console.log(`order filled at TxHash: ${fillTxReceipt.transactionHash}`);


//done : swap is completed
