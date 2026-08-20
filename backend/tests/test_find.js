import { connectDB, Block, setLocalJSON } from '../utils/db.js';

const test = async () => {
  setLocalJSON(true);
  const blocks = await Block.find();
  console.log('Blocks read:', blocks);
  console.log('Blocks length:', blocks.length);
  process.exit(0);
};

test();
