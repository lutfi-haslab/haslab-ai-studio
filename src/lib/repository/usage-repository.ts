/**
 * Usage Repository
 * 
 * Manages CRUD operations for usage records and analytics.
 */

import type { IUsageRepository, UsageRecord, ModelStats } from './types'
import type { IStorageAdapter } from './types'
import { STORE_NAMES } from './indexeddb-adapter'

export class UsageRepository implements IUsageRepository {
  constructor(private adapter: IStorageAdapter) {}

  async getAll(): Promise<UsageRecord[]> {
    const records = await this.adapter.getAll<UsageRecord>(STORE_NAMES.USAGE)
    // Sort by timestamp descending
    return records.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  async getById(id: string): Promise<UsageRecord | null> {
    return this.adapter.get<UsageRecord>(STORE_NAMES.USAGE, id)
  }

  async getByProvider(provider: string): Promise<UsageRecord[]> {
    return this.adapter.query<UsageRecord>(
      STORE_NAMES.USAGE,
      (record) => record.provider === provider
    )
  }

  async getByDateRange(start: Date, end: Date): Promise<UsageRecord[]> {
    return this.adapter.query<UsageRecord>(
      STORE_NAMES.USAGE,
      (record) => {
        const timestamp = new Date(record.timestamp).getTime()
        return timestamp >= start.getTime() && timestamp <= end.getTime()
      }
    )
  }

  async getTotalCost(start?: Date, end?: Date): Promise<number> {
    let records = await this.getAll()
    
    if (start || end) {
      records = records.filter(record => {
        const timestamp = new Date(record.timestamp).getTime()
        if (start && timestamp < start.getTime()) return false
        if (end && timestamp > end.getTime()) return false
        return true
      })
    }

    return records.reduce((total, record) => total + record.metrics.cost, 0)
  }

  async getStatsByModel(): Promise<ModelStats[]> {
    const records = await this.getAll()
    const statsMap = new Map<string, ModelStats>()

    records.forEach(record => {
      const key = `${record.provider}:${record.model}`
      const existing = statsMap.get(key)

      if (existing) {
        existing.totalCalls++
        existing.totalTokens += record.metrics.totalTokens
        existing.totalCost += record.metrics.cost
      } else {
        statsMap.set(key, {
          model: record.model,
          provider: record.provider,
          totalCalls: 1,
          totalTokens: record.metrics.totalTokens,
          totalCost: record.metrics.cost,
        })
      }
    })

    return Array.from(statsMap.values()).sort((a, b) => b.totalCost - a.totalCost)
  }

  async create(item: Omit<UsageRecord, 'id'>): Promise<UsageRecord> {
    const record: UsageRecord = {
      ...item,
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: item.timestamp || new Date(),
    }
    await this.adapter.put(STORE_NAMES.USAGE, record)
    return record
  }

  async update(id: string, updates: Partial<UsageRecord>): Promise<UsageRecord> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(`Usage record with id ${id} not found`)
    }

    const updated: UsageRecord = {
      ...existing,
      ...updates,
      id, // Ensure id doesn't change
    }

    await this.adapter.put(STORE_NAMES.USAGE, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORE_NAMES.USAGE, id)
  }
}
