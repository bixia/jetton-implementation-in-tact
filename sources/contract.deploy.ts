import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { DexRouter, storeDeploy } from "./output/dexRouter_DexRouter";


import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();

(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    let mnemonics = (process.env.mnemonics || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    console.log(deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);


    // Compute init data for deployment
    // NOTICE: the parameters inside the init functions were the input for the contract address
    // which means any changes will change the smart contract address as well

    let init = await DexRouter.init(deployer_wallet_contract.address);
    let dexRouterAddr = contractAddress(workchain, init);
    let deployAmount = toNano("0.15");


    // send a message on new address contract to deploy it
    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno: ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");

    printSeparator();

    let packed_msg = beginCell()
        .store(
            storeDeploy({
                $$type: "Deploy",
                queryId: BigInt("123"),
            })
        )
        .endCell();

    await deployer_wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: dexRouterAddr,
                value: deployAmount,
                init: {
                    code: init.code,
                    data: init.data,
                },
                body: packed_msg,
            }),
        ],
    });
    console.log("====== Deployment message sent to =======\n", dexRouterAddr);
})();
