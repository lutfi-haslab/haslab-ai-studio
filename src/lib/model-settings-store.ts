import { Store } from '@tanstack/react-store'

export interface ModelSettings {
  provider: string
  model: string
  systemInstructions: string
  temperature: number
  maxTokens: number
  topP: number
}

export const modelSettingsStore = new Store<ModelSettings>({
  provider: 'openrouter',
  model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
  systemInstructions: '',
  temperature: 1,
  maxTokens: 8192,
  topP: 0.95,
})
