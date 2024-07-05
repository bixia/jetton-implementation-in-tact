import "@stdlib/ownable";
import "@stdlib/stoppable"; // this would automatically import @stdlib/ownable too!
import "./messages";
struct StonFiJettonInfo {
    op: Int as uint32;
    tokenA: Address;
    receiver: Address;
    tokenB: Address;
    minReturn: Int as coins;
}
struct StonFiNativeInfo {
    op: Int as uint32;
    tokenA: Address;
    receiver: Address;
    tokenB: Address;
    minReturn: Int as coins;
}

contract DexRouter with Resumable {
    content: Cell;
    stopped: Bool;
    const StonFi_Jetton: Int = 0x11220000;
    init(owner: Address, content: Cell){
        self.owner = owner;
        self.content = content;
        self.stopped = false;
    }

    receive(msg: TokenNotification){
        require(!(self.stopped), "paused!");
        require(msg.amount > ton(1), "at least 1 ton");
        let user: Address = msg.from;
        let payload: Slice = msg.forward_payload;
        dump(tokenA);
        let op: Int = payload.loadUint(32);
        dump(op);
        if (op == StonFi_Jetton) {
            let stonfiJettonInfo: StonFiJettonInfo = StonFiJettonInfo.fromSlice(payload);
            self.handleStonfiJetton(stonfiJettonInfo);
        } else if (op == StonFi_Native) {} else {
            self.returnToken();
        }
    }

    fun handleStonfiJetton(info: StonFiJettonInfo) {}
}