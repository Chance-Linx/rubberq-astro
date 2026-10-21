import {createRfqRuntime} from './runtime.mjs';
const runtime=await createRfqRuntime({port:4399});
console.log('Local RFQ Worker ready at '+await runtime.mf.ready+'; D1/R2 are isolated and all email/network delivery is intercepted.');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await runtime.mf.dispose();process.exit(0)});
