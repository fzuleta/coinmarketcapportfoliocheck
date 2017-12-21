import * as ct from "console.table";
import {trace, FgBlue, BgGreen, BgCyan, FgGreen, BgBlue, BgBlack, FgYellow} from "./common/helpers";
import * as WebRequest from "web-request";
import * as sk from "string-kit";
import holdings from "./data";
 
const results = new Promise( async (resolve, reject) => {
    // make calls to the coinmarketcap api
    const calls = holdings.map(async (it, i) => {
        const ret = {currency: it.currency, amount: it.amount, total: 0, currentPrice: 0};
        const result = await WebRequest.json<any>(`https://api.coinmarketcap.com/v1/ticker/${it.ticker}`);
        const usd = result[0].price_usd;
        ret.currentPrice = usd;
        ret.total = it.amount * usd; 
        return ret;
    });

    // resolve them one by one
    const total = calls.length;
    let c = 0;
    const res = [];
    calls.map((it, i) => {
        it.then((o) => {
            c++;
            res.push(o);
            if (c === total) {
                resolve(res);
            }
        });
    });
});

// print results
results.then((res: any) => {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    let total = 0;
    trace(sk.format("%s\t%s\t%s\t%s", `Currency`, `Amount`, `USD Price`, `Total`), BgBlue);
    trace("", BgBlack);
    res.map((it) => {
        trace(sk.format("%s\t\t%s\t\t%s\t\t%s", `${it["currency"]}`, `${it["amount"]}`, `$${it["currentPrice"]}`, `$${it["total"]}`), FgYellow);
        total += it["total"];
    });
    // print total
    trace(`USD: $${total}`, FgGreen);
});
