import { blockchain } from '../utils/blockchain.js';
import { Block } from '../utils/db.js';

export const getChain = async (req, res) => {
  try {
    const chain = await Block.find().sort({ index: 1 });
    res.json(chain);
  } catch (err) {
    console.error('Get blockchain error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const validateChain = async (req, res) => {
  try {
    const result = await blockchain.validateChain();
    res.json(result);
  } catch (err) {
    console.error('Validate blockchain error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
