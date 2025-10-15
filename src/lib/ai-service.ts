import { ChatOpenAI } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import { BASEURL } from './ai-models'
import ENV from './env'
import type { ModelSettings } from './model-settings-store'

export function getAIProvider(settings: ModelSettings) {
  const { provider, model, temperature, topP } = settings

  switch (provider) {
    case 'openrouter':
      if (!ENV.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key is not set. Please add VITE_OPENROUTER_KEY to your .env file')
      }
      return new ChatOpenAI({
        apiKey: ENV.OPENROUTER_API_KEY,
        model: model,
        temperature: temperature,
        topP: topP,
        configuration: {
          baseURL: `${BASEURL.openrouter}/api/v1`
        }
      })

    case 'deepseek':
      if (!ENV.DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key is not set. Please add VITE_DEEPSEEK_KEY to your .env file')
      }
      return new ChatDeepSeek({
        apiKey: ENV.DEEPSEEK_API_KEY,
        model: model,
        temperature: temperature,
        topP: topP
      })

    case 'iflow':
      if (!ENV.IFLOW_API_KEY) {
        throw new Error('iFlow API key is not set. Please add VITE_IFLOW_KEY to your .env file')
      }
      
      const iflowBaseURL = `${BASEURL.iflow}/v1`
      console.log('[iFlow] Initializing with baseURL:', iflowBaseURL, 'model:', model)
      
      return new ChatOpenAI({
        apiKey: ENV.IFLOW_API_KEY,
        model: model,
        temperature: temperature,
        topP: topP,
        configuration: {
          baseURL: iflowBaseURL
        }
      })

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
