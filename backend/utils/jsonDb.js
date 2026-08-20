import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const isBackendDir = path.basename(process.cwd()) === 'backend';
const DATA_DIR = isBackendDir ? path.resolve('data') : path.resolve('backend/data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const generateObjectId = () => {
  return crypto.randomBytes(12).toString('hex');
};

const matchesQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;

  return Object.entries(query).every(([key, value]) => {
    // Support OR queries
    if (key === '$or' && Array.isArray(value)) {
      return value.some(subQuery => matchesQuery(item, subQuery));
    }

    const itemVal = item[key];

    // Support Mongoose regex matching: { field: { $regex: 'pattern', $options: 'i' } }
    if (value && typeof value === 'object' && '$regex' in value) {
      const pattern = value.$regex;
      const flags = value.$options || '';
      const regex = new RegExp(pattern, flags);
      return regex.test(String(itemVal || ''));
    }

    // Normal equality match
    return String(itemVal) === String(value);
  });
};

export class JSONModel {
  constructor(modelName) {
    this.modelName = modelName;
    this.filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}.json`);
    this.initFile();

    const self = this;

    // This is the class that mimics a Mongoose model instance
    const ModelClass = class {
      constructor(data = {}) {
        Object.assign(this, data);
        if (!this._id) {
          this._id = generateObjectId();
        }
      }

      async save() {
        const data = self.read();
        const idx = data.findIndex(item => String(item._id) === String(this._id));
        this.updatedAt = new Date().toISOString();
        
        // Remove helper references when writing to file
        const plainObj = { ...this };
        delete plainObj.save;

        if (idx !== -1) {
          data[idx] = plainObj;
        } else {
          this.createdAt = new Date().toISOString();
          plainObj.createdAt = this.createdAt;
          data.push(plainObj);
        }
        self.write(data);
        return this;
      }
    };

    // Attach static query methods to the class
    const staticMethods = [
      'find', 'findOne', 'findById', 'create',
      'findByIdAndUpdate', 'findByIdAndDelete',
      'countDocuments', 'deleteMany'
    ];

    for (const method of staticMethods) {
      ModelClass[method] = (...args) => self[method](...args);
    }

    this.ModelClass = ModelClass;
    return ModelClass;
  }

  initFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  read() {
    this.initFile();
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading database file: ${this.filePath}`, e);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing database file: ${this.filePath}`, e);
    }
  }

  // Query Methods (invoked via proxy statics)
  find(query = {}) {
    const data = this.read();
    const results = data.filter(item => matchesQuery(item, query));
    
    // Support basic mongoose query chaining (.sort, .skip, .limit)
    const chainable = {
      data: results,
      sort(sortQuery) {
        if (sortQuery) {
          const [[key, order]] = Object.entries(sortQuery);
          this.data.sort((a, b) => {
            if (a[key] < b[key]) return order === -1 ? 1 : -1;
            if (a[key] > b[key]) return order === -1 ? -1 : 1;
            return 0;
          });
        }
        return this;
      },
      skip(count) {
        this.data = this.data.slice(count);
        return this;
      },
      limit(count) {
        this.data = this.data.slice(0, count);
        return this;
      },
      then(resolve) {
        resolve(this.data);
      }
    };
    
    return chainable;
  }

  async findOne(query = {}) {
    const data = this.read();
    const matched = data.find(item => matchesQuery(item, query));
    if (!matched) return null;
    
    // Return wrapped instance so it has the .save() method
    return new this.ModelClass(matched);
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(docData) {
    const instance = new this.ModelClass(docData);
    return instance.save();
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const data = this.read();
    const index = data.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;

    let updatedDoc = { ...data[index] };

    // Support Mongoose array push: { $push: { certificates: certId } }
    if (updateData.$push) {
      for (const [key, val] of Object.entries(updateData.$push)) {
        if (!Array.isArray(updatedDoc[key])) {
          updatedDoc[key] = [];
        }
        if (val && typeof val === 'object' && '$each' in val) {
          updatedDoc[key].push(...val.$each);
        } else {
          updatedDoc[key].push(val);
        }
      }
    } else {
      updatedDoc = {
        ...updatedDoc,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
    }

    data[index] = updatedDoc;
    this.write(data);
    return new this.ModelClass(updatedDoc);
  }

  async findByIdAndDelete(id) {
    const data = this.read();
    const index = data.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const [deleted] = data.splice(index, 1);
    this.write(data);
    return deleted;
  }

  async countDocuments(query = {}) {
    const data = this.read();
    return data.filter(item => matchesQuery(item, query)).length;
  }

  async deleteMany(query = {}) {
    const data = this.read();
    const remaining = data.filter(item => !matchesQuery(item, query));
    this.write(remaining);
    return { deletedCount: data.length - remaining.length };
  }
}
