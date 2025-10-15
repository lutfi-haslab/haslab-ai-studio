import ENV from './env'
import { BASEURL } from './ai-models'

interface TestResult {
  provider: string
  success: boolean
  error?: string
  message?: string
}

async function testOpenRouter(): Promise<TestResult> {
  if (!ENV.OPENROUTER_API_KEY) {
    return { provider: 'OpenRouter', success: false, error: 'API key not set' }
  }

  try {
    const response = await fetch(`${BASEURL.openrouter}/api/v1/models`, {
      headers: {
        'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
      }
    })

    if (response.ok) {
      return { provider: 'OpenRouter', success: true, message: 'API key is valid' }
    } else {
      const data = await response.json().catch(() => ({}))
      return { provider: 'OpenRouter', success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
  } catch (error: any) {
    return { provider: 'OpenRouter', success: false, error: error.message }
  }
}

async function testDeepSeek(): Promise<TestResult> {
  if (!ENV.DEEPSEEK_API_KEY) {
    return { provider: 'DeepSeek', success: false, error: 'API key not set' }
  }

  try {
    const response = await fetch(`${BASEURL.deepseek}/models`, {
      headers: {
        'Authorization': `Bearer ${ENV.DEEPSEEK_API_KEY}`,
      }
    })

    if (response.ok) {
      return { provider: 'DeepSeek', success: true, message: 'API key is valid' }
    } else {
      const data = await response.json().catch(() => ({}))
      return { provider: 'DeepSeek', success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
  } catch (error: any) {
    return { provider: 'DeepSeek', success: false, error: error.message }
  }
}

async function testIFlow(): Promise<TestResult> {
  if (!ENV.IFLOW_API_KEY) {
    return { provider: 'iFlow', success: false, error: 'API key not set' }
  }

  try {
    const response = await fetch(`${BASEURL.iflow}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.IFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'tstars2.0',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok || data.choices) {
      return { provider: 'iFlow', success: true, message: 'API key is valid' }
    } else if (data.status === '434') {
      return { provider: 'iFlow', success: false, error: 'Invalid API key' }
    } else {
      return { provider: 'iFlow', success: false, error: data.msg || data.error?.message || `HTTP ${response.status}` }
    }
  } catch (error: any) {
    return { provider: 'iFlow', success: false, error: error.message }
  }
}

export async function testAllAPIKeys(): Promise<TestResult[]> {
  console.log('🔍 Testing API keys...')
  
  const results = await Promise.all([
    testOpenRouter(),
    testDeepSeek(),
    testIFlow()
  ])

  console.log('\n📊 API Key Test Results:')
  console.log('─'.repeat(60))
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const status = result.success ? result.message : result.error
    console.log(`${icon} ${result.provider}: ${status}`)
  })
  
  console.log('─'.repeat(60))
  
  return results
}
