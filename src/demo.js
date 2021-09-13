const sha256 = require("crypto-js/sha256");
class Block {
	constructor(transactions, previousHash) {
		this.transactions = transactions; // 这块记录了数据，转账数据
		this.previousHash = previousHash; // 这块记录了上一个区块的哈希值，第一个的区块为root
		this.timestamp = '20210101'; // 方便学习写为固定时间
		this.nonce = 1; // 随机数

		this.hash = this.mine(); // 这个区块的哈希
	}

	// 这里把整个区块都加入哈希运算
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

// 创建一个block，去除区块链上一个block的哈希
const block2 = new Block('张三给李四转20块钱', blockChain.getLastBlock().hash)
// 新的block加入到区块链
blockChain.addBlock(block2);

console.log(blockChain, blockChain.isValidAllBlock());