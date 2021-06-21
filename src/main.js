const ecLib = require('elliptic').ec;
const ec = new ecLib('secp256k1') // curve name

const { Transaction, Chain, Block } = require("./blockChainDemo");

const chain = new Chain(3);
const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate('hex')
const publicKeySender = keyPairSender.getPublic('hex')

const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate('hex')
const publicKeyReceiver = keyPairReceiver.getPublic('hex')

const t1 = new Transaction(publicKeySender, publicKeyReceiver, 10);
t1.sign(ec.keyFromPrivate(privateKeySender))
console.log(t1)
// t1.amount=20
// const t2 = new Transaction("addr2", "addr1", 5);
chain.addTransaction(t1);
// chain.addTransaction(t2);

// console.log(chain)
chain.mineTransactionPool("addr3");
console.log(chain.validateChain())
console.log(chain)
console.log(chain.chain[1])