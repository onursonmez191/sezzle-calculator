import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

async function fillForm() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('First number'), '12')
  await user.type(screen.getByLabelText('Second number'), '3')
  return user
}

describe('Calculator', () => {
  it('sends the inputs to the API and displays the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"result":4}'))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    const user = await fillForm()
    await user.selectOptions(screen.getByLabelText('Operation'), 'divide')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(await screen.findByRole('status')).toHaveTextContent('4')
    expect(fetchMock).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'divide', a: 12, b: 3 }),
    })
  })

  it('does not submit empty inputs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter two valid numbers')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows validation errors returned by the backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('{"error":"cannot divide by zero"}', { status: 400 }),
    ))
    render(<App />)
    const user = await fillForm()
    await user.clear(screen.getByLabelText('Second number'))
    await user.type(screen.getByLabelText('Second number'), '0')
    await user.selectOptions(screen.getByLabelText('Operation'), 'divide')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero')
  })

  it('shows an error when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    render(<App />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect to the server')
  })

  it.each([
    ['empty error response', '', 500],
    ['HTML error response', '<html>Bad gateway</html>', 502],
    ['null JSON response', 'null', 200],
  ])('handles an unexpected %s', async (_name, body, status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status })))
    render(<App />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The server returned an unexpected response. Please try again.',
    )
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeEnabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('disables the form while loading, displays zero, and clears the result on edits', async () => {
    let finishRequest!: (response: Response) => void
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => { finishRequest = resolve }),
    ))
    render(<App />)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByRole('button', { name: 'Calculating…' })).toBeDisabled()
    expect(screen.getByLabelText('First number')).toBeDisabled()
    finishRequest(new Response('{"result":0}'))
    expect(await screen.findByRole('status')).toHaveTextContent('0')

    await user.type(screen.getByLabelText('First number'), '1')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
