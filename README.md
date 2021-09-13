# 前言
一直对区块链感兴趣，读了区块链的[白皮书](https://bitcoin.org/bitcoin.pdf)，然后查找了相关资料视频，有一位up主，时间过的久了忘记录视频的 Up 主是谁了，他讲的比较我写的好。下面用简单的代码段来描述区块链，项目不包含 p2p 网络，仅是描述简单的区块链的全部过程，如果你对编程不太了解，不太建议你读。

# 目录
- 1.概述
- 2.块 block
- 3.块加密
- 4.块验证
- 5.挖矿
- 6.区块链 chain
- 7.区块链增加 block 加密和验证
- 8.区块链验证链上所有的block的数据是否被篡改

# 1. 概述
区块链本质是一个分布式数据库，区块链每次增加数据都会再区块链上增加一个块，每一个块上面包含本次转账的数据。

# 2. 块 Block
块是重要概念，每诞生一个块，上面记录转账数据。
```
const sha256 = require("crypto-js/sha256");
class Block {
	constructor(transactions, previousHash) {
		this.transactions = transactions; // 这块记录了数据，转账数据
		this.previousHash = previousHash; // 这块记录了上一个区块的哈希值，第一个的区块为root
		this.timestamp = '20210101'; // 时间
		this.nonce = 1; // 随机数

		this.hash = this.mine(); // 这个区块的哈希
	}

	// 这里把整个区块的内容都加入哈希运算
	computeHash() {
		return sha256(
			JSON.stringify(this.transactions) +
			this.previousHash +
			this.timestamp +
			this.nonce
		).toString();
	}

	//  验证哈希
	isValid() {
		if (this.computeHash() === this.hash) {
			return true
		} else {
			return false
		}
	}
	// 挖矿
	mine() {
		// 计算出来的哈希值，我们调整难度，开头必须是000
		for (; ;) {
			const hash = this.computeHash()
			console.log(hash);
			if ('000' === hash.substring(0, 3)) {
				return hash;
			}
			this.nonce++;
		}
	}
}

const blokc = new Block('小明给小李了10块钱', 'root');
console.log(blokc);

```
输出
```
Block {
  transactions: '小明给小李了10块钱',
  previousHash: 'root',
  timestamp: '20210101',
  hash: 'f2381b469c8c67dc123fa0f067094efbfb47a607e0e50cacd42faa519d627031'
}
```


# 3. 块加密
computeHash 把整个块内的所有数据都哈希运算出来，修改块内任何参数都导致块哈希值变化。
```
 // 这里把整个区块都加入哈希运算
    computeHash() {
        return sha256(
            JSON.stringify(this.transactions) +
            this.previousHash +
            this.timestamp
        ).toString();
    }
```

# 4. 块的验证
任何人修改了块里的任何东西，块的哈希值都会改变
```
	//  验证哈希
	isValid(hash) {
		if (this.computeHash() === hash) {
			return true
		} else {
			return false
		}
	}

const blokc = new Block('小明给小李了10块钱', 'root');
// 篡改 block 内容
blokc.transactions = '小明给小李了20块钱';
// 校验
console.log(blokc.isValid());
```
输出，表示内容被篡改了。
```
false
```

# 5. 挖矿
简单理解，BTC 是分布式，保证数据统一，BTC 调整哈希难度 10 分钟左右出一个区块。
我们调整哈希运算出来的值保证哈希值不那么容易运算出来，开头 000 越多，越难算出来，这也是挖矿的由来。
```
	mine() {
		// 计算出来的哈希值，我们调整难度，开头必须是000
		for (; ;) {
			const hash = this.computeHash()
			console.log(hash);
			if ('000' === hash.substring(0, 3)) {
				return hash;
			}
			this.nonce++;
		}
	}

const blokc = new Block('小明给小李了10块钱', 'root');
```


# 6. 区块链 BlockChain
多个区块就组成一个区块链，我们可以看到 blokc1.hash，传到了下一个块当previousHash，这样区块形成的依赖关系，除最后一个区块前面任何一个区块的数据修改，我们验证哈希的时候就会对不上。
```
const blokc1 = new Block('小明给小李了10块钱', 'root');
const blokc2 = new Block('小明给小李了20块钱', blokc1.hash);
const blokc3 = new Block('小明给小李了30块钱', blokc2.hash);
const blokc4 = new Block('小明给小李了40块钱', blokc3.hash);
```
为了方便管理 block，我们创建 BlockChain
```


class BlockChain {
	constructor() {
		// 根结点，创世节点
		const root = new Block('', 'root');
		this.chain = [root];
	}

	// 获取区块链最后block
	getLastBlock() {
		return this.chain[this.chain.length - 1]
	}

	// 区块链加上block
	addBlock(block) {
		// 检查block，数据是否正确
		const valid = this.isValidBlock(block)
		if (valid) {
			this.chain.push(block)
		}
	}

	// 验证 block 是否正确
	isValidBlock(block) {
		const hash = block.hash;
		// 验证难度
		if ('000' === hash.substring(0, 3)) {
			// 验证内容哈希
			if (hash === this.computeHash(block)) {
				return true
			}
		}

		console.log('此 block 数据有问题，拒绝加入链上');
		return false
	}

	// 重新计算 Hash
	computeHash(block) {
		return sha256(
			JSON.stringify(block.transactions) +
			block.previousHash +
			block.timestamp +
			block.nonce
		).toString();
	}

	// 验证所有block
	isValidAllBlock() {
		for (let index = 0; index < this.chain.length; index++) {
			const block = this.chain[index];
			// 判断后一个区块包含前一个区块hash
			if (index > 0) {
				const previousBlock = this.chain[index-1];
				if (block.previousHash !== previousBlock.hash) {
					// 区块链被串改
					console.log('区块链被串改');
					return false
				}
			}

			const valid = this.isValidBlock(block)
			if (!valid) {
				// 区块链被串改
				console.log('区块链被串改');
				return false
			}
		}

		return true
	}
}

// 创建区块链，内置一个根block
const blockChain = new BlockChain()
// 创建一个block，去除区块链上一个block的哈希
const block1 = new Block('张三给李四转10块钱', blockChain.getLastBlock().hash)
// 新的block加入到区块链
blockChain.addBlock(block1);

console.log(blockChain);
```
输出
```
BlockChain {
  chain: [
    Block {
      transactions: '',
      previousHash: 'root',
      timestamp: '20210101',
      nonce: 10370,
      hash: '000bae2c8bc2ee810ec0df87bcc188f59bde5c904c008534d9356caf7da18ce9'
    },
    Block {
      transactions: '张三给李四转10块钱',
      previousHash: '000bae2c8bc2ee810ec0df87bcc188f59bde5c904c008534d9356caf7da18ce9',
      timestamp: '20210101',
      nonce: 6385,
      hash: '0006963e0f9b7422c7a9f92d501dcb3928e5b90d52ede1cb75ffb4fb274fcf64'
    }
  ]
}
```

# 7. 区块链增加 block 加密和验证
不是所有的block都允许加入到链上，我们需要先判断挖矿证明也就是哈希值头几位。再判断block内容是否对的上哈希值。
```
	// 区块链加上block
	addBlock(block) {
		// 检查block，数据是否正确
		const valid = this.isValidAddBlock(block)
		if (valid) {
			this.chain.push(block)
		}
	}

	// 验证 block 是否正确
	isValidAddBlock(block) {
		const hash = block.hash;
		// 验证难度
		if ('000' === hash.substring(0, 3)) {
			// 验证内容哈希
			if (hash === this.computeHash(block)) {
				return true
			}
		}

		console.log('此 block 数据有问题，拒绝加入链上');
		return false
	}

	// 重新计算 Hash
	computeHash(block) {
		return sha256(
			JSON.stringify(block.transactions) +
			block.previousHash +
			block.timestamp +
			block.nonce
		).toString();
	}

```

# 8. 区块链数据验证
区块链验证链上所有的block的数据是否被篡改
```
	// 验证所有block
	isValidAllBlock() {
		for (let index = 0; index < this.chain.length; index++) {
			const block = this.chain[index];
			// 判断后一个区块包含前一个区块hash
			if (index > 0) {
				const previousBlock = this.chain[index-1];
				if (block.previousHash !== previousBlock.hash) {
					// 区块链被串改
					console.log('区块链被串改');
					return false
				}
			}

			const valid = this.isValidBlock(block)
			if (!valid) {
				// 区块链被串改
				console.log('区块链被串改');
				return false
			}
		}

		return true
	}

```
打印
```
// 创建区块链，内置一个根block
const blockChain = new BlockChain()
// 创建一个block，去除区块链上一个block的哈希
const block1 = new Block('张三给李四转10块钱', blockChain.getLastBlock().hash)
// 新的block加入到区块链
blockChain.addBlock(block1);

// 创建一个block，去除区块链上一个block的哈希
const block2 = new Block('张三给李四转20块钱', blockChain.getLastBlock().hash)
// 新的block加入到区块链
blockChain.addBlock(block2);

console.log(blockChain, blockChain.isValidAllBlock());

BlockChain {
  chain: [
    Block {
      transactions: '',
      previousHash: 'root',
      timestamp: '20210101',
      nonce: 10370,
      hash: '000bae2c8bc2ee810ec0df87bcc188f59bde5c904c008534d9356caf7da18ce9'
    },
    Block {
      transactions: '张三给李四转10块钱',
      previousHash: '000bae2c8bc2ee810ec0df87bcc188f59bde5c904c008534d9356caf7da18ce9',
      timestamp: '20210101',
      nonce: 6385,
      hash: '0006963e0f9b7422c7a9f92d501dcb3928e5b90d52ede1cb75ffb4fb274fcf64'
    },
    Block {
      transactions: '张三给李四转20块钱',
      previousHash: '0006963e0f9b7422c7a9f92d501dcb3928e5b90d52ede1cb75ffb4fb274fcf64',
      timestamp: '20210101',
      nonce: 8282,
      hash: '00088e43b85eb31887056673d7760d681525b7f91e5774a0cc8ca9d4ee40907f'
    }
  ]
} true
```


# GitHub
以上是简单区块链技术的概要，代码地址：https://github.com/liangtongzhuo/btc






