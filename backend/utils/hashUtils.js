import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes the SHA-256 hash of a buffer.
 * @param {Buffer} buffer 
 * @returns {string} hex hash
 */
export const calculateBufferHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Computes the SHA-256 hash of a file on disk.
 * @param {string} filePath 
 * @returns {Promise<string>} hex hash
 */
export const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};
