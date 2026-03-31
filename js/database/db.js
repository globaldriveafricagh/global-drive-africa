export const DB_NAME = 'CarsMarketplaceDB';
export const DB_VERSION = 1;

class Database {
  constructor() {
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Users Store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Cars Store
        if (!db.objectStoreNames.contains('cars')) {
          const carStore = db.createObjectStore('cars', { keyPath: 'id', autoIncrement: true });
          carStore.createIndex('brand', 'brand', { unique: false });
          carStore.createIndex('price', 'price', { unique: false });
          carStore.createIndex('status', 'status', { unique: false }); // 'available', 'sold'
        }

        // Orders Store
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
          orderStore.createIndex('userId', 'userId', { unique: false });
        }

        // Installments Store
        if (!db.objectStoreNames.contains('installments')) {
          const instStore = db.createObjectStore('installments', { keyPath: 'id', autoIncrement: true });
          instStore.createIndex('userId', 'userId', { unique: false });
        }

        // Messages Store
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
          msgStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async doTransaction(storeName, mode, callback) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      let result;
      try {
        const req = callback(store);
        if (req && req.onsuccess !== undefined) {
           req.onsuccess = () => resolve(req.result);
           req.onerror = () => reject(req.error);
        } else {
           transaction.oncomplete = () => resolve(result);
           transaction.onerror = () => reject(transaction.error);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  // Generic CRUD
  getAll(storeName) {
    return this.doTransaction(storeName, 'readonly', store => store.getAll());
  }

  getById(storeName, id) {
    return this.doTransaction(storeName, 'readonly', store => store.get(Number(id)));
  }

  getByIndex(storeName, indexName, value) {
    return this.doTransaction(storeName, 'readonly', store => store.index(indexName).getAll(value));
  }

  getOneByIndex(storeName, indexName, value) {
    return this.doTransaction(storeName, 'readonly', store => store.index(indexName).get(value));
  }

  insert(storeName, data) {
    return this.doTransaction(storeName, 'readwrite', store => store.add(data));
  }

  update(storeName, data) {
    return this.doTransaction(storeName, 'readwrite', store => store.put(data));
  }

  delete(storeName, id) {
    return this.doTransaction(storeName, 'readwrite', store => store.delete(Number(id)));
  }
}

export const dbInstance = new Database();
