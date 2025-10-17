/**
 * Repository Manager
 * 
 * Central access point for all repositories.
 * Provides singleton instances and initialization.
 */

import { indexedDBAdapter } from './indexeddb-adapter'
import { ProjectRepository } from './project-repository'
import { MediaRepository } from './media-repository'
import { UsageRepository } from './usage-repository'

// Singleton instances
let projectRepository: ProjectRepository | null = null
let mediaRepository: MediaRepository | null = null
let usageRepository: UsageRepository | null = null

// Initialize flag
let initialized = false

/**
 * Initialize all repositories
 * Should be called once at app startup
 */
export async function initializeRepositories(): Promise<void> {
  if (initialized) return

  await indexedDBAdapter.initialize()
  
  projectRepository = new ProjectRepository(indexedDBAdapter)
  mediaRepository = new MediaRepository(indexedDBAdapter)
  usageRepository = new UsageRepository(indexedDBAdapter)
  
  initialized = true
}

/**
 * Get project repository instance
 */
export function getProjectRepository(): ProjectRepository {
  if (!projectRepository) {
    throw new Error('Repositories not initialized. Call initializeRepositories() first.')
  }
  return projectRepository
}

/**
 * Get media repository instance
 */
export function getMediaRepository(): MediaRepository {
  if (!mediaRepository) {
    throw new Error('Repositories not initialized. Call initializeRepositories() first.')
  }
  return mediaRepository
}

/**
 * Get usage repository instance
 */
export function getUsageRepository(): UsageRepository {
  if (!usageRepository) {
    throw new Error('Repositories not initialized. Call initializeRepositories() first.')
  }
  return usageRepository
}

// Re-export types and interfaces
export * from './types'
