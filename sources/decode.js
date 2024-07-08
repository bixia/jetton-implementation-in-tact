const TonWeb = require('tonweb');

const tonweb = new TonWeb();

let boc = "b5ee9c7201010101006b0000d1
112200008008a10ad5eb536e671de0d33911cc9701f0d0796c1a5be8612d14382541b8932d5002e5be78b33ce99ecdf571df0cb258f9395704ec994ff342829f78ad73ceae7742007217886e12dae04a7ef4e70d65740a2a970300f3bf828869c4288240a6b23d0d84"

const dec = TonWeb.boc.Cell.fromBoc(boc);

console.log(dec[0].bits)
