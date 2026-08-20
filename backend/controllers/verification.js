import { Certificate, Block } from '../utils/db.js';
import { calculateBufferHash } from '../utils/hashUtils.js';
import { blockchain } from '../utils/blockchain.js';

export const verifyById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch certificate from database
    const certificate = await Certificate.findOne({ certificateId: id });
    if (!certificate) {
      return res.status(404).json({
        verified: false,
        status: 'fake',
        message: 'No certificate found with this ID. Verification failed.'
      });
    }

    // 2. Fetch all blocks and find the one containing this certificate ID
    const blocks = await Block.find({});
    const matchedBlock = blocks.find(b => 
      b.data && b.data.some(tx => tx.certificateId === id)
    );

    if (!matchedBlock) {
      return res.status(400).json({
        verified: false,
        status: 'tampered',
        message: 'Certificate metadata exists, but no corresponding blockchain block was found!',
        certificate
      });
    }

    // 3. Verify block details and ledger consistency
    // Validate if the stored certificate hash matches the transaction hash in the block
    const blockTx = matchedBlock.data.find(tx => tx.certificateId === id);
    if (blockTx.pdfHash !== certificate.hash) {
      return res.status(400).json({
        verified: false,
        status: 'tampered',
        message: 'Tampering detected! The certificate hash stored in the ledger does not match the file hash.',
        certificate,
        block: matchedBlock
      });
    }

    // Perform validation check on the chain
    const validationResult = await blockchain.validateChain();
    if (!validationResult.isValid) {
      return res.status(400).json({
        verified: false,
        status: 'tampered',
        message: `Warning: Blockchain chain validation failed! Reason: ${validationResult.reason}`,
        certificate,
        block: matchedBlock
      });
    }

    res.json({
      verified: true,
      status: 'genuine',
      message: 'Certificate successfully verified on the blockchain ledger.',
      certificate,
      block: {
        index: matchedBlock.index,
        timestamp: matchedBlock.timestamp,
        nonce: matchedBlock.nonce,
        previousHash: matchedBlock.previousHash,
        hash: matchedBlock.hash
      }
    });
  } catch (err) {
    console.error('Verify by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyByFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF certificate file.' });
    }

    // 1. Calculate the SHA-256 hash of the uploaded file buffer in-memory
    const fileHash = calculateBufferHash(req.file.buffer);
    console.log(`Calculated hash of uploaded file: ${fileHash}`);

    // 2. Query the Certificate database by PDF file hash
    const certificate = await Certificate.findOne({ hash: fileHash });
    if (!certificate) {
      return res.status(404).json({
        verified: false,
        status: 'fake',
        message: 'This certificate file is either fake or has been tampered with. No match found on the blockchain ledger.'
      });
    }

    // 3. Find the block in the blockchain ledger
    const blocks = await Block.find({});
    const matchedBlock = blocks.find(b => 
      b.data && b.data.some(tx => tx.pdfHash === fileHash)
    );

    if (!matchedBlock) {
      return res.status(400).json({
        verified: false,
        status: 'tampered',
        message: 'Certificate match found in the database, but block verification failed on the blockchain ledger.',
        certificate
      });
    }

    // 4. Validate full chain integrity
    const validationResult = await blockchain.validateChain();
    if (!validationResult.isValid) {
      return res.status(400).json({
        verified: false,
        status: 'tampered',
        message: `Warning: Certificate matches but the blockchain network is compromised. Reason: ${validationResult.reason}`,
        certificate,
        block: matchedBlock
      });
    }

    res.json({
      verified: true,
      status: 'genuine',
      message: 'Certificate successfully verified. Document matches block on ledger.',
      certificate,
      block: {
        index: matchedBlock.index,
        timestamp: matchedBlock.timestamp,
        nonce: matchedBlock.nonce,
        previousHash: matchedBlock.previousHash,
        hash: matchedBlock.hash
      }
    });
  } catch (err) {
    console.error('Verify by file error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
