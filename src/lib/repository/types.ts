/**
 * Repository & Adapter Pattern Types
 * 
 * This module defines the core types and interfaces for the data persistence layer.
 * The repository pattern abstracts data operations from storage implementation details.
 */

// ===== Core Entity Types =====

export interface Project {
  id: string
  name: string
  description?: string
  template: string
  createdAt: Date
  updatedAt: Date
  files?: Record<string, string> // file path -> content
  metadata?: Record<string, any>
}

export interface MediaGeneration {
  id: string
  type: 'image' | 'video'
  prompt: string
  model: string
  url: string
  style?: string
  quality?: string
  lighting?: string
  theme?: string
  timestamp: Date
  usage?: UsageMetrics
  metadata?: Record<string, any>
}

export interface UsageMetrics {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  imageTokens?: number
  inputImages?: number
  outputImages?: number
  cost: number
}

export interface UsageRecord {
  id: string
  provider: string
  model: string
  type: 'chat' | 'media' | 'code'
  timestamp: Date
  metrics: UsageMetrics
  metadata?: Record<string, any>
}

// ===== Repository Interfaces =====

export interface IRepository<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(item: Omit<T, 'id'>): Promise<T>
  update(id: string, item: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface IProjectRepository extends IRepository<Project> {
  getByName(name: string): Promise<Project | null>
  search(query: string): Promise<Project[]>
}

export interface IMediaRepository extends IRepository<MediaGeneration> {
  getByType(type: 'image' | 'video'): Promise<MediaGeneration[]>
  getByDateRange(start: Date, end: Date): Promise<MediaGeneration[]>
  search(filters: MediaFilters): Promise<MediaGeneration[]>
}

export interface IUsageRepository extends IRepository<UsageRecord> {
  getByProvider(provider: string): Promise<UsageRecord[]>
  getByDateRange(start: Date, end: Date): Promise<UsageRecord[]>
  getTotalCost(start?: Date, end?: Date): Promise<number>
  getStatsByModel(): Promise<ModelStats[]>
}

// ===== Helper Types =====

export interface MediaFilters {
  type?: 'image' | 'video'
  style?: string
  model?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface ModelStats {
  model: string
  provider: string
  totalCalls: number
  totalTokens: number
  totalCost: number
}

// ===== Storage Adapter Interface =====

export interface IStorageAdapter {
  initialize(): Promise<void>
  get<T>(storeName: string, id: string): Promise<T | null>
  getAll<T>(storeName: string): Promise<T[]>
  put<T>(storeName: string, item: T): Promise<void>
  delete(storeName: string, id: string): Promise<void>
  query<T>(storeName: string, predicate: (item: T) => boolean): Promise<T[]>
  clear(storeName: string): Promise<void>
}
