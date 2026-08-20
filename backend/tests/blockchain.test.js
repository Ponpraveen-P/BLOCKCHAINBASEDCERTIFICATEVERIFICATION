import { blockchain } from '../utils/blockchain.js';
import { Block, setLocalJSON } from '../utils/db.js';

const runTests = async () => {
  console.log('🧪 Starting Blockchain Simulator Tests...');
  
  // Force JSON fallback database for tests to prevent MongoDB dependency during testing
  setLocalJSON(true);
  
  try {
    // 1. Clear previous blocks
    console.log('🧹 Clearing test block data...');
    await Block.deleteMany({});
    
    // 2. Initialize
    console.log('🏁 Initializing blockchain...');
    await blockchain.initialize();
    
    // Check if Genesis block exists
    const latest = await blockchain.getLatestBlock();
    if (latest && latest.index === 0) {
      console.log('✅ Genesis block verified successfully.');
    } else {
      throw new Error('Genesis block creation failed!');
    }

    // 3. Mine a block
    console.log('⛏️ Mining Block 1 (B.Tech Certificate transaction)...');
    const mockTx = {
      certificateId: 'cert_123456',
      recipient: 'Aarav Sharma',
      course: 'B.Tech Computer Science',
      college: 'Indian Institute of Technology, Delhi',
      hash: 'a35be196721598f828a2b535d8e75cd21bb91c9535de4bf2de75323497d54408'
    };
    
    const block1 = await blockchain.mineBlock([mockTx]);
    console.log('✅ Block 1 mined successfully.');
    
    // 4. Validate Chain
    console.log('🔍 Validating chain integrity...');
    let validation = await blockchain.validateChain();
    console.log('Validation result:', validation);
    if (validation.isValid && validation.count === 2) {
      console.log('✅ Blockchain validation passed successfully.');
    } else {
      throw new Error(`Chain validation failed! Reason: ${validation.reason}`);
    }

    // 5. Mine Block 2
    console.log('⛏️ Mining Block 2 (MCA Certificate transaction)...');
    const mockTx2 = {
      certificateId: 'cert_789012',
      recipient: 'Priya Patel',
      course: 'Master of Computer Applications',
      college: 'National Institute of Technology, Trichy',
      hash: '5d852a44bb4f14bf9d12345d8e75cd21bb91c9535de4bf2de75323497d54408'
    };
    await blockchain.mineBlock([mockTx2]);
    
    validation = await blockchain.validateChain();
    console.log('Validation after Block 2:', validation);
    if (!validation.isValid) {
      throw new Error(`Chain validation failed after mining block 2! Reason: ${validation.reason}`);
    }
    
    // 6. Test Tampering
    console.log('👿 Simulating data tampering (editing Block 1 data)...');
    const blocksInDb = await Block.find().sort({ index: 1 });
    
    // We modify block 1 in memory and save it back
    const blockToTamper = blocksInDb[1]; // block at index 1 is Block 1
    blockToTamper.data[0].recipient = 'Aarav Sharma (Tampered Name)';
    
    // Save the tampered block back to the database
    // We instantiate the class so we can call save
    const blockInstance = new Block(blockToTamper);
    await blockInstance.save();
    
    console.log('🔍 Re-validating tampered chain...');
    validation = await blockchain.validateChain();
    console.log('Tampered chain validation result:', validation);
    
    if (!validation.isValid) {
      console.log('✅ SUCCESS: Blockchain successfully caught the tampering!');
      console.log(`❌ Reason caught: "${validation.reason}"`);
    } else {
      throw new Error('FAIL: Blockchain did not detect tampering!');
    }
    
    console.log('🎉 All blockchain simulator unit tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

runTests();
