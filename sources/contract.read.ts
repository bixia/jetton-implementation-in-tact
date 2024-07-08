import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano, JettonWallet, JettonMaster } from "@ton/ton";
import { mnemonicToPrivateKey } from "ton-crypto";

import { printSeparator } from "./utils/print";


import { DexRouter, storeStonFiJettonInfo, storeTokenTransfer } from "./output/dexRouter_DexRouter";
import { Address } from "@ton/core/dist/address/Address";

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
    console.log("deployer", deployer_wallet.address);

    let deployer_wallet_contract = client4.open(deployer_wallet);


    printSeparator();




    let dexRouterAddr = "EQCaYDTSENZRZPm5YUFR0RSjbwevdj161g04oEdNGfhgWkkK"

    let dexRouter = Address.parse(dexRouterAddr);
    console.log("dexRouter: " + dexRouter);
    let contract = await client4.open(DexRouter.fromAddress(dexRouter));
    let owner = await contract.getOwner();
    console.log("owner", owner)
    let stopped = await contract.getStopped();
    console.log("stopped", stopped);
    let seq = await contract.getGetSeq();
    console.log("seq", seq)
    let router = await contract.getGetStonfiRouter();
    console.log("stonfi_router", router);
    let fwd = await contract.getGetStonfiFwdAmount();
    console.log("fwd", fwd);
    let txorigin = await contract.getGetStonfiTxorigin();
    console.log("txorigin", txorigin);


    printSeparator();

    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno: ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");

    let usdt_wallet_addr = Address.parse("EQBfd44HDtKE5XalCIR_8fPWg7XW0HNGPQhmtcM7ACDIBG3w")
    let usdt_wallet = JettonWallet.create(usdt_wallet_addr);
    let usdt_wallet_contract = client4.open(usdt_wallet);
    console.log("usdt balance", await usdt_wallet_contract.getBalance())


    let usdt_master_addr = Address.parse("EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs")
    let usdt_master = JettonMaster.create(usdt_master_addr)
    let usdt_master_contract = client4.open(usdt_master)
    let dexRouter_usdt_addr = await usdt_master_contract.getWalletAddress(dexRouter);
    console.log("dexRouter_usdt_addr", dexRouter_usdt_addr)
    console.log("deployer usdt addr", await usdt_master_contract.getWalletAddress(deployer_wallet_contract.address))

    let stonfi_router_addr = Address.parse("EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt")
    let fish_master_addr = Address.parse("EQATcUc69sGSCCMSadsVUKdGwM1BMKS-HKCWGPk60xZGgwsK")
    let router_fish_addr = Address.parse("EQDkLxDcJbXAlP3pzhrK6BRVLgYB538FENOIUQSBTWR6GypP")

    let fish_master = JettonMaster.create(fish_master_addr)
    let fish_master_contract = client4.open(fish_master)
    console.log("fish stonfi router", await fish_master_contract.getWalletAddress(stonfi_router_addr))
    printSeparator();




    let msgValue = toNano("0.3")
    let payload_raw = beginCell()
        .store(
            storeStonFiJettonInfo({
                $$type: "StonFiJettonInfo",
                op: BigInt("0x11220001"),
                tokenA: dexRouter_usdt_addr,
                receiver: deployer_wallet.address,
                tokenB: router_fish_addr,
                minReturn: BigInt(0)
            })
        )
        .endCell()
    console.log(payload_raw)
    let payload = beginCell().storeMaybeRef(payload_raw).endCell();
    let packed_msg = beginCell()
        .store(
            storeTokenTransfer({
                $$type: "TokenTransfer",
                query_id: BigInt("111"),
                amount: BigInt("10"),
                sender: dexRouter,
                response_destination: deployer_wallet_contract.address,
                custom_payload: null,
                forward_ton_amount: toNano("0.03"),
                forward_payload: payload
            })
        )
        .endCell()

    let res = await deployer_wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: usdt_wallet_addr,
                value: msgValue,
                body: packed_msg
            })
        ]
    })
    // console.log(res)


})();
