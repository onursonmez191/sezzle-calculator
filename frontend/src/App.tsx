import { useState } from 'react'
import type { FormEvent } from 'react'
import { calculate } from './api'
import type { Operation } from './api'

export default function App() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [operation, setOperation] = useState<Operation>('add')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function clearResult() {
    setResult(null)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearResult()

    if (!a.trim() || !b.trim() || !Number.isFinite(Number(a)) || !Number.isFinite(Number(b))) {
      setError('Please enter two valid numbers.')
      return
    }

    setLoading(true)
    try {
      setResult(await calculate(operation, Number(a), Number(b)))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="calculator">
      <h1>Calculator</h1>
      <p>Enter two numbers and choose an operation.</p>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={loading}>
          <label htmlFor="first-number">First number</label>
          <input
            id="first-number"
            type="number"
            step="any"
            required
            value={a}
            onChange={(event) => { setA(event.target.value); clearResult() }}
          />

          <label htmlFor="operation">Operation</label>
          <select
            id="operation"
            value={operation}
            onChange={(event) => { setOperation(event.target.value as Operation); clearResult() }}
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (−)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
          </select>

          <label htmlFor="second-number">Second number</label>
          <input
            id="second-number"
            type="number"
            step="any"
            required
            value={b}
            onChange={(event) => { setB(event.target.value); clearResult() }}
          />

          <button type="submit">{loading ? 'Calculating…' : 'Calculate'}</button>
        </fieldset>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      <div aria-live="polite">
        {result !== null && <p className="result">Result: <output>{result}</output></p>}
      </div>
    </main>
  )
}
