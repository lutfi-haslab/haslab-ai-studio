/**
 * Project Repository
 * 
 * Manages CRUD operations for projects using the storage adapter.
 */

import type { IProjectRepository, Project } from './types'
import type { IStorageAdapter } from './types'
import { STORE_NAMES } from './indexeddb-adapter'

export class ProjectRepository implements IProjectRepository {
  constructor(private adapter: IStorageAdapter) {}

  async getAll(): Promise<Project[]> {
    const projects = await this.adapter.getAll<Project>(STORE_NAMES.PROJECTS)
    // Sort by updatedAt descending
    return projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async getById(id: string): Promise<Project | null> {
    return this.adapter.get<Project>(STORE_NAMES.PROJECTS, id)
  }

  async getByName(name: string): Promise<Project | null> {
    const projects = await this.adapter.query<Project>(
      STORE_NAMES.PROJECTS,
      (project) => project.name === name
    )
    return projects[0] || null
  }

  async search(query: string): Promise<Project[]> {
    const lowerQuery = query.toLowerCase()
    return this.adapter.query<Project>(
      STORE_NAMES.PROJECTS,
      (project) => 
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery) ||
        false
    )
  }

  async create(item: Omit<Project, 'id'>): Promise<Project> {
    const now = new Date()
    const project: Project = {
      ...item,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    }
    await this.adapter.put(STORE_NAMES.PROJECTS, project)
    return project
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = await this.getById(id)
    if (!existing) {
      throw new Error(`Project with id ${id} not found`)
    }

    const updated: Project = {
      ...existing,
      ...updates,
      id, // Ensure id doesn't change
      updatedAt: new Date(),
    }

    await this.adapter.put(STORE_NAMES.PROJECTS, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.adapter.delete(STORE_NAMES.PROJECTS, id)
  }
}
