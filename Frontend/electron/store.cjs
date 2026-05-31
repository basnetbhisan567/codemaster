const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class ElectronStore {
  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'store.json');
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (error) {
      console.error('Failed to load store:', error);
    }
    return {};
  }

  save() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save store:', error);
    }
  }

  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  delete(key) {
    delete this.data[key];
    this.save();
  }

  clear() {
    this.data = {};
    this.save();
  }

  has(key) {
    return this.data[key] !== undefined;
  }

  getAll() {
    return { ...this.data };
  }
}

const store = new ElectronStore();

module.exports = { store };