export type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

export async function calculate(operation: Operation, a: number, b: number): Promise<number> {
  let response: Response
  try {
    response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, a, b }),
    })
  } catch {
    throw new Error('Could not connect to the server. Please try again.')
  }

  const unexpectedResponse = 'The server returned an unexpected response. Please try again.'
  let data: { result?: number; error?: string } | null
  try {
    data = await response.json()
  } catch {
    throw new Error(unexpectedResponse)
  }
  if (!data || typeof data !== 'object') {
    throw new Error(unexpectedResponse)
  }
  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Calculation failed. Please try again.')
  }
  if (typeof data.result !== 'number' || !Number.isFinite(data.result)) {
    throw new Error('The server returned an invalid result.')
  }
  return data.result
}
