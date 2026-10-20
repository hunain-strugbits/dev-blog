'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CommentForm({ postId }: { postId: number }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPending(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: postId, body: body.trim() }),
      })

      if (!res.ok) {
        setError('Could not post your comment. Please try again.')
        return
      }

      setBody('')
      router.refresh()
    } catch {
      setError('Could not post your comment. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment-body" className="comment-form-label">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        className="comment-form-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        rows={4}
        required
      />
      {error && <p className="comment-form-error">{error}</p>}
      <button
        type="submit"
        className="comment-form-submit"
        disabled={pending || body.trim().length === 0}
      >
        {pending ? 'Posting…' : 'Post comment'}
      </button>
    </form>
  )
}
