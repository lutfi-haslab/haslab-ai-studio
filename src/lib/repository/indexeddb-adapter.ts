/**
 * IndexedDB Storage Adapter
 * 
 * Implements the IStorageAdapter interface using IndexedDB for local persistence.
 * This adapter can be swapped with other implementations (PostgreSQL, REST API, etc.)
 */

import type { IStorageAdapter } from './types'

const DB_NAME = 'haslab_studio_db'
const DB_VERSION = 1

export const STORE_NAMES = {
  PROJECTS: 'projects',
  MEDIA: 'media_generations',
  USAGE: 'usage_records',
  CONVERSATIONS: 'conversations',
} as const

export class IndexedDBAdapter implements IStorageAdapter {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async initialize(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORE_NAMES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORE_NAMES.PROJECTS, { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: false })
          projectStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.MEDIA)) {
          const mediaStore = db.createObjectStore(STORE_NAMES.MEDIA, { keyPath: 'id' })
          mediaStore.createIndex('type', 'type', { unique: false })
          mediaStore.createIndex('timestamp', 'timestamp', { unique: false })
          mediaStore.createIndex('model', 'model', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.USAGE)) {
          const usageStore = db.createObjectStore(STORE_NAMES.USAGE, { keyPath: 'id' })
          usageStore.createIndex('provider', 'provider', { unique: false })
          usageStore.createIndex('model', 'model', { unique: false })
          usageStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.CONVERSATIONS)) {
          const convStore = db.createObjectStore(STORE_NAMES.CONVERSATIONS, { keyPath: 'id' })
          convStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get item from ${storeName}`))
      }
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${storeName}`))
      }
    })
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to put item in ${storeName}`))
      }
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete item from ${storeName}`))
      }
    })
  }

  async query<T>(storeName: string, predicate: (item: T) => boolean): Promise<T[]> {
    await this.initialize()
    this.ensureInitialized()

    const allItems = await this.getAll<T>(storeName)
    return allItems.filter(predicate)
  }

  async clear(storeName: string): Promise<void> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`))
      }
    })
  }

  // Helper method for querying by index
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    await this.initialize()
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(new Error(`Failed to query index ${indexName} in ${storeName}`))
      }
    })
  }
}

// Singleton instance
export const indexedDBAdapter = new IndexedDBAdapter()
