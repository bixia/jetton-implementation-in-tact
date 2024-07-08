import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano } from "@ton/ton";

import { printSeparator } from "./utils/print";

// Contract Abi //
import { buildOnchainMetadata } from "./utils/jetton-helpers";
import { mnemonicToPrivateKey } from "ton-crypto";

import { DexRouter } from "./output/dexRouter_DexRouter";
import { Address } from "@ton/core/dist/address/Address";


(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client = new TonClient4({
        endpoint: "https://sandbox-v4.tonhubapi.com",
    });
    let mnemonics = (process.env.mnemonics || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);


    let dexRouterAddr = "EQAdJqADkE0xlSOC0AneS9O_Zwft7YIc7yxaeJguGoD0eYJZ"
    // Create content Cell

    let dexRouter = Address.parse(dexRouterAddr);
    console.log("dexRouter: " + dexRouter);
    let contract = await client.open(DexRouter.fromAddress(dexRouter));
    let owner = await contract.getOwner();
    console.log(owner)
    // let jetton_wallet = await contract_ddd.getGetWalletAddress(deploy_wallet_contract.address);
    // let contract_dataFormat = JettonDefaultWallet.fromAddress(jetton_wallet);
    // let contract = client.open(contract_dataFormat);
    // console.log("Deployer's JettonWallet: " + contract.address);
    // let jettonWalletBalance = await (await contract.getGetWalletData()).balance;
    // let owner_of_wallet = await (await contract.getGetWalletData()).owner;
    // console.log("JettonWallet Balance: " + jettonWalletBalance);
    // console.log("JettonWallet Owner: \n" + owner_of_wallet);
    // TODO:
    // // loadOwnershipAssigned => msg.forwardload
    // let aa = loadTransferEvent(src.asSlice());
    // console.log("Mint MemberID: " + aa.item_index + ", by " + aa.minter);
})();
