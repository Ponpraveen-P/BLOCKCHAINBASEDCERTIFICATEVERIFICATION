import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { JSONModel } from './jsonDb.js';
import MongooseUser from '../models/User.js';
import MongooseStudent from '../models/Student.js';
import MongooseCertificate from '../models/Certificate.js';
import MongooseBlock from '../models/Block.js';

dotenv.config();

let useLocalJSON = false;

const jsonModels = {
  User: new JSONModel('User'),
  Student: new JSONModel('Student'),
  Certificate: new JSONModel('Certificate'),
  Block: new JSONModel('Block')
};

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain_certificates';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Switching to JSON File storage fallback.');
    useLocalJSON = true;
  }
};

const getModel = (name, mongooseModel) => {
  return new Proxy(mongooseModel, {
    get(target, prop) {
      const activeModel = useLocalJSON ? jsonModels[name] : target;
      const value = activeModel[prop];
      if (typeof value === 'function') {
        return value.bind(activeModel);
      }
      return value;
    },
    construct(target, args) {
      const activeModel = useLocalJSON ? jsonModels[name] : target;
      return new activeModel(...args);
    }
  });
};

export const User = getModel('User', MongooseUser);
export const Student = getModel('Student', MongooseStudent);
export const Certificate = getModel('Certificate', MongooseCertificate);
export const Block = getModel('Block', MongooseBlock);
export const getDatabaseMode = () => useLocalJSON ? 'JSON' : 'MongoDB';
export const isLocalJSON = () => useLocalJSON;
export const setLocalJSON = (val) => { useLocalJSON = val; };

