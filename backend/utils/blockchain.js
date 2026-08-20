import crypto from 'crypto';
import { Block } from './db.js';

export const calculateHash = (index, previousHash, timestamp, data, nonce) => {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + JSON.stringify(data) + nonce)
    .digest('hex');
};

class Blockchain {
  constructor() {
    this.difficulty = parseInt(process.env.MINING_DIFFICULTY) || 4;
  }

  // Load the chain from DB or initialize with Genesis block
  async initialize() {
    try {
      const blocks = await Block.find().sort({ index: 1 });
      
      if (blocks.length === 0) {
        console.log('🔗 Blockchain is empty. Initializing Genesis block...');
        await this.createGenesisBlock();
      } else {
        console.log(`🔗 Blockchain loaded. Total blocks: ${blocks.length}`);
      }
    } catch (error) {
      console.error('❌ Error initializing blockchain:', error);
    }
  }

  async createGenesisBlock() {
    const index = 0;
    const previousHash = '0';
    const timestamp = new Date().toISOString();
    const data = [{ text: 'Genesis Block - Academic Certificate Verification System' }];
    const nonce = 0;
    const hash = calculateHash(index, previousHash, timestamp, data, nonce);

    const genesisBlock = new Block({
      index,
      timestamp,
      data,
      previousHash,
      hash,
      nonce
    });

    await genesisBlock.save();
    console.log('🎉 Genesis block mined and stored successfully.');
  }

  async getLatestBlock() {
    const blocks = await Block.find().sort({ index: 1 });
    return blocks[blocks.length - 1];
  }

  // Mines a new block with certificate transactions
  async mineBlock(blockData) {
    const latestBlock = await this.getLatestBlock();
    const index = latestBlock.index + 1;
    const previousHash = latestBlock.hash;
    const timestamp = new Date().toISOString();
    let nonce = 0;
    let hash = '';

    console.log(`🔨 Mining block ${index}...`);
    const prefix = '0'.repeat(this.difficulty);
    
    while (true) {
      hash = calculateHash(index, previousHash, timestamp, blockData, nonce);
      if (hash.startsWith(prefix)) {
        break;
      }
      nonce++;
    }

    console.log(`💎 Block ${index} mined! Nonce: ${nonce}, Hash: ${hash}`);

    const newBlock = new Block({
      index,
      timestamp,
      data: blockData,
      previousHash,
      hash,
      nonce
    });

    await newBlock.save();
    return newBlock;
  }

  // Validates the entire blockchain integrity
  async validateChain() {
    const blocks = await Block.find().sort({ index: 1 });
    
    if (blocks.length === 0) {
      return { isValid: false, reason: 'Empty chain' };
    }

    // Check genesis block
    const genesis = blocks[0];
    if (genesis.index !== 0 || genesis.previousHash !== '0') {
      return { isValid: false, reason: 'Invalid genesis block' };
    }

    const prefix = '0'.repeat(this.difficulty);

    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // 1. Verify index link
      if (currentBlock.index !== previousBlock.index + 1) {
        return {
          isValid: false,
          reason: `Index mismatch at block ${currentBlock.index}. Expected ${previousBlock.index + 1}, got ${currentBlock.index}`
        };
      }

      // 2. Verify previous hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          reason: `Hash connection broken at block ${currentBlock.index}. Block points to previousHash: ${currentBlock.previousHash}, but actual previous hash is ${previousBlock.hash}`
        };
      }

      // 3. Verify current block's hash is correct based on its components
      const recalculatedHash = calculateHash(
        currentBlock.index,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          reason: `Hash mismatch at block ${currentBlock.index}. Recalculated hash does not match stored hash`
        };
      }

      // 4. Verify proof of work was done (unless genesis/mocked, here we verify difficulty)
      if (!currentBlock.hash.startsWith(prefix)) {
        return {
          isValid: false,
          reason: `Block ${currentBlock.index} hash does not meet proof of work difficulty criteria (${this.difficulty} zeros)`
        };
      }
    }

    return { isValid: true, count: blocks.length };
  }
}

export const blockchain = new Blockchain();
export default blockchain;
