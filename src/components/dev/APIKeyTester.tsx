import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { testAllAPIKeys } from '@/lib/test-api-keys'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function APIKeyTester() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<Array<{
    provider: string
    success: boolean
    error?: string
    message?: string
  }>>([])

  const handleTest = async () => {
    setTesting(true)
    setResults([])
    
    try {
      const testResults = await testAllAPIKeys()
      setResults(testResults)
    } catch (error) {
      console.error('Error testing API keys:', error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm font-medium">API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTest} 
          disabled={testing}
          className="w-full"
          variant="outline"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test All API Keys'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.provider}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">{result.provider}</span>
                </div>
                <div className="text-right">
                  {result.success ? (
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="destructive" className="text-xs">Failed</Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.error}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          This test validates your API keys by making test requests to each provider.
          Check console for detailed logs.
        </p>
      </CardContent>
    </Card>
  )
}
