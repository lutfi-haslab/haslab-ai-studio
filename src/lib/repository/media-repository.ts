/**
 * Media Repository
 * 
 * Manages CRUD operations for media generations (images/videos).
 */

import type { IMediaRepository, MediaGeneration, MediaFilters } from './types'
import type { IStorageAdapter } from './types'
import { STORE_NAMES } from './indexeddb-adapter'

export class MediaRepository implements IMediaRepository {
  constructor(private adapter: IStorageAdapter) {}

  async getAll(): Promise<MediaGeneration[]> {
    const media = await this.adapter.getAll<MediaGeneration>(STORE_NAMES.MEDIA)
    // Sort by timestamp descending
    return media.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  async getById(id: string): Promise<MediaGeneration | null> {
    return this.adapter.get<MediaGeneration>(STORE_NAMES.MEDIA, id)
  }

  async getByType(type: 'image' | 'video'): Promise<MediaGeneration[]> {
    return this.adapter.query<MediaGeneration>(
      STORE_NAMES.MEDIA,
      (item) => item.type === type
    )
  }

  async getByDateRange(start: Date, end: Date): Promise<MediaGeneration[]> {
    return this.adapter.query<MediaGeneration>(
      STORE_NAMES.MEDIA,
      (item) => {
        const timestamp = new Date(item.timestamp).getTime()
        return timestamp >= start.getTime() && timestamp <= end.getTime()
      }
    )
  }

  async search(filters: MediaFilters): Promise<MediaGeneration[]> {
    return this.adapter.query<MediaGeneration>(
      STORE_NAMES.MEDIA,
      (item) => {
        if (filters.type && item.type !== filters.type) return false
        if (filters.style && item.style !== filters.style) return false
        if (filters.model && item.model !== filters.model) return false
        if (filters.dateFrom && new Date(item.timestamp) < filters.dateFrom) return false
        if (filters.dateTo && new Date(item.timestamp) > filters.dateTo) return false
        return true
      }
    )
  }

  async create(item: Omit<MediaGeneration, 'id'>): Promise<MediaGeneration> {
    const media: MediaGeneration = {
      ...item,
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: item.timestamp || new Date(),
    }
    await this.adapter.put(STORE_NAMES.MEDIA, media)
    return media
  }

  async update(id: string, updates: Partial<MediaGeneration>): Promise<MediaGeneration> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(`Media generation with id ${id} not found`)
    }

    const updated: MediaGeneration = {
      ...existing,
      ...updates,
      id, // Ensure id doesn't change
    }

    await this.adapter.put(STORE_NAMES.MEDIA, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORE_NAMES.MEDIA, id)
  }
}
