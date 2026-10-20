import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import { getAuthorName } from '@/lib/authorName'
import { CommentForm } from '@/components/CommentForm'

const styles = `
  .post-page {
    --fg: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --chip-bg: #f3f4f6;
    --link: #0070f3;
    color: var(--fg);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .post-page {
      --fg: #f3f4f6;
      --muted: #9ca3af;
      --border: #374151;
      --chip-bg: #1f2937;
      --link: #60a5fa;
    }
  }

  .post-page a { color: var(--link); text-decoration: none; }
  .post-page a:hover { text-decoration: underline; }

  .post-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 1.25rem 5rem;
  }

  .post-back {
    display: inline-block;
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }

  .post-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .post-category {
    background: var(--chip-bg);
    color: var(--fg);
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 500;
  }
  .post-page a.post-category { color: var(--fg); }
  .post-page a.post-category:hover { text-decoration: none; background: var(--border); }

  .post-title {
    font-size: clamp(2rem, 5vw, 2.75rem);
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .post-meta {
    margin-top: 1rem;
    color: var(--muted);
    font-size: 0.9375rem;
  }

  .post-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 2rem 0 2.5rem;
    border-radius: 12px;
    overflow: hidden;
    background: var(--chip-bg);
  }

  .post-content {
    font-size: 1.125rem;
    line-height: 1.75;
  }
  .post-content > * + * { margin-top: 1.25rem; }
  .post-content h1,
  .post-content h2,
  .post-content h3,
  .post-content h4 {
    line-height: 1.25;
    letter-spacing: -0.01em;
    margin-top: 2.25rem;
  }
  .post-content h2 { font-size: 1.75rem; }
  .post-content h3 { font-size: 1.375rem; }
  .post-content ul,
  .post-content ol { padding-left: 1.5rem; }
  .post-content li + li { margin-top: 0.4rem; }
  .post-content blockquote {
    margin-left: 0;
    padding-left: 1.25rem;
    border-left: 3px solid var(--border);
    color: var(--muted);
    font-style: italic;
  }
  .post-content pre {
    overflow-x: auto;
    padding: 1rem;
    border-radius: 8px;
    background: var(--chip-bg);
    font-size: 0.9rem;
  }
  .post-content code {
    background: var(--chip-bg);
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .post-content pre code { background: none; padding: 0; }
  .post-content img { max-width: 100%; height: auto; border-radius: 8px; }

  .post-footer {
    margin-top: 3.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  .comments {
    margin-top: 3.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  .comments-title { margin: 0 0 1.5rem; font-size: 1.375rem; }
  .comments-empty,
  .comments-login { color: var(--muted); }
  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0 0 2rem;
    padding: 0;
    list-style: none;
  }
  .comment {
    padding: 1rem 1.25rem;
    background: var(--chip-bg);
    border-radius: 10px;
  }
  .comment-meta { margin: 0 0 0.375rem; color: var(--muted); font-size: 0.875rem; }
  .comment-meta strong { color: var(--fg); }
  .comment-body { margin: 0; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }

  .comment-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .comment-form-label { font-weight: 600; }
  .comment-form-input {
    width: 100%;
    padding: 0.75rem;
    color: var(--fg);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    font: inherit;
    resize: vertical;
    box-sizing: border-box;
  }
  .comment-form-input:focus-visible { outline: 3px solid var(--link); outline-offset: 2px; }
  .comment-form-error { margin: 0; color: #dc2626; font-size: 0.875rem; }
  .comment-form-submit {
    align-self: flex-start;
    padding: 0.625rem 1.25rem;
    color: #fff;
    background: var(--link);
    border: none;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .comment-form-submit:disabled { opacity: 0.5; cursor: default; }

  .post-locked {
    max-width: 480px;
    margin: 6rem auto;
    padding: 2.5rem 1.5rem;
    text-align: center;
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .post-locked h1 { font-size: 1.5rem; margin: 0.75rem 0 0.5rem; }
  .post-locked p { color: var(--muted); margin: 0 0 1.5rem; }
`

function formatDate(date?: string | null) {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export default async function SinglePostPage({ params }: { params: Promise<{ slug: string }> }) {
    const payload = await getPayload({ config: configPromise })

    const { slug } = await params

    const posts = await payload.find({
        collection: 'Posts',
        where: { slug: { equals: slug } },
        limit: 1,
    })

    const post = posts.docs[0]

    if (!post) return notFound()

    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    if (post.requiresAuth && !user) {
        return (
            <main className="post-page">
                <style>{styles}</style>
                <div className="post-locked">
                    <div style={{ fontSize: '2.5rem' }} aria-hidden="true">🔒</div>
                    <h1>Members only</h1>
                    <p>Log in to read this post.</p>
                    <Link href="/posts">Back to all posts</Link>
                </div>
            </main>
        )
    }

    const comments = await payload.find({
        collection: 'comments',
        where: { post: { equals: post.id } },
        sort: 'createdAt',
        limit: 100,
        depth: 0,
    })

    const categories = (post.categories ?? []).filter(
        (category): category is Exclude<typeof category, string | number> =>
            typeof category === 'object' && category !== null,
    )

    const authorId =
        post.author && typeof post.author === 'object' ? post.author.id : post.author
    const author = authorId
        ? await payload
              .findByID({
                  collection: 'users',
                  id: authorId,
                  depth: 0,
                  select: { email: true },
                  overrideAccess: true,
              })
              .catch(() => null)
        : null

    const date = formatDate(post.createdAt)
    const cover =
        post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url
            ? post.coverImage
            : null

    return (
        <main className="post-page">
            <style>{styles}</style>

            <article className="post-container">
                <Link href="/posts" className="post-back">
                    ← All posts
                </Link>

                <header>
                    {categories.length > 0 && (
                        <div className="post-categories">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.id}`}
                                    className="post-category"
                                >
                                    {category.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    <h1 className="post-title">{post.title}</h1>

                    {(author || date) && (
                        <p className="post-meta">
                            {author && (
                                <>
                                    By <Link href={`/authors/${author.id}`}>{getAuthorName(author.email)}</Link>
                                    {date && ' · '}
                                </>
                            )}
                            {date && <time dateTime={post.createdAt}>{date}</time>}
                        </p>
                    )}
                </header>

                {cover && (
                    <div className="post-cover">
                        <Image
                            src={cover.url!}
                            alt={cover.alt || post.title}
                            fill
                            priority
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 720px) 100vw, 720px"
                        />
                    </div>
                )}

                <div className="post-content">
                    {post.content && <RichText data={post.content} />}
                </div>

                <section className="comments" aria-labelledby="comments-heading">
                    <h2 id="comments-heading" className="comments-title">
                        Comments ({comments.totalDocs})
                    </h2>

                    {comments.docs.length === 0 ? (
                        <p className="comments-empty">No comments yet. Be the first to comment.</p>
                    ) : (
                        <ul className="comment-list">
                            {comments.docs.map((comment) => (
                                <li key={comment.id} className="comment">
                                    <p className="comment-meta">
                                        <strong>{comment.authorName ?? 'Anonymous'}</strong>
                                        {' · '}
                                        <time dateTime={comment.createdAt}>
                                            {formatDate(comment.createdAt)}
                                        </time>
                                    </p>
                                    <p className="comment-body">{comment.body}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {user ? (
                        <CommentForm postId={post.id} />
                    ) : (
                        <p className="comments-login">
                            <Link href="/login">Log in</Link> to leave a comment.
                        </p>
                    )}
                </section>

                <footer className="post-footer">
                    <Link href="/posts">← Back to all posts</Link>
                </footer>
            </article>
        </main>
    )
}