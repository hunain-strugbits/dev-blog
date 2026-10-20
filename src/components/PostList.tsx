import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/payload-types'

export const POSTS_PER_PAGE = 9

export const postListStyles = `
  .posts-page {
    --fg: #111827;
    --muted: #6b7280;
    --bg: #ffffff;
    --surface: #f3f4f6;
    --border: #e5e7eb;
    --accent: #0070f3;
    color: var(--fg);
    background: var(--bg);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .posts-page {
      --fg: #f3f4f6;
      --muted: #9ca3af;
      --bg: #0b0f19;
      --surface: #111827;
      --border: #1f2937;
      --accent: #3b82f6;
    }
  }

  .posts-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
  }

  .posts-back {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: var(--accent);
    font-size: 0.9rem;
    text-decoration: none;
  }
  .posts-back:hover { text-decoration: underline; }

  .posts-header { margin-bottom: 2.5rem; }
  .posts-title {
    margin: 0;
    font-size: clamp(2rem, 5vw, 2.75rem);
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .posts-subtitle {
    margin: 0.5rem 0 0;
    color: var(--muted);
    font-size: 1.0625rem;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .post-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    color: inherit;
    text-decoration: none;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: border-color 0.15s ease;
  }
  .post-card:hover { border-color: var(--accent); }
  .post-card:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }

  .post-card-cover {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--surface);
  }
  .post-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.25rem;
  }
  .post-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  .post-card-tag {
    background: var(--surface);
    padding: 0.125rem 0.625rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .post-card-title {
    margin: 0;
    font-size: 1.1875rem;
    line-height: 1.3;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .post-card-excerpt {
    margin: 0;
    color: var(--muted);
    font-size: 0.9375rem;
    line-height: 1.6;
  }
  .post-card-meta {
    margin-top: auto;
    padding-top: 0.5rem;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .term-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  .term-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    color: inherit;
    text-decoration: none;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: border-color 0.15s ease;
  }
  .term-card:hover { border-color: var(--accent); }
  .term-card:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
  .term-card-name {
    overflow: hidden;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .term-card-count {
    flex-shrink: 0;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.9375rem;
  }
  .pagination-status { color: var(--muted); }
  .pagination-link {
    padding: 0.5rem 1rem;
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 0.15s ease;
  }
  .pagination-link:hover { border-color: var(--accent); }
  .pagination-link:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
  .pagination-link[aria-disabled='true'] {
    color: var(--muted);
    opacity: 0.5;
    pointer-events: none;
  }

  .posts-empty {
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
`

type LexicalNode = { text?: string; children?: LexicalNode[] }

// Pulls plain text out of a Lexical editor state so cards can show a short excerpt
function getExcerpt(content: unknown, maxLength = 140): string {
    const root = (content as { root?: LexicalNode } | null | undefined)?.root
    if (!root?.children) return ''

    const collect = (node: LexicalNode): string => {
        if (typeof node.text === 'string') return node.text
        return (node.children ?? []).map(collect).join('')
    }

    let text = ''
    for (const block of root.children) {
        text += `${collect(block)} `
        if (text.length > maxLength) break
    }

    text = text.trim()
    if (text.length <= maxLength) return text

    return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}

function formatDate(date?: string | null) {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function PostGrid({ posts }: { posts: Post[] }) {
    if (posts.length === 0) {
        return <p className="posts-empty">No posts yet. Check back soon.</p>
    }

    return (
        <div className="posts-grid">
            {posts.map((post) => {
                const categories = (post.categories ?? []).filter(
                    (category): category is Exclude<typeof category, string | number> =>
                        typeof category === 'object' && category !== null,
                )
                const cover =
                    post.coverImage && typeof post.coverImage === 'object' && post.coverImage.url
                        ? post.coverImage
                        : null
                const excerpt = getExcerpt(post.content)
                const date = formatDate(post.createdAt)
                const hasTags = categories.length > 0 || post.requiresAuth

                return (
                    <Link key={post.id} href={`/posts/${post.slug}`} className="post-card">
                        {cover && (
                            <div className="post-card-cover">
                                <Image
                                    src={cover.url!}
                                    alt={cover.alt || post.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 640px) 100vw, 320px"
                                />
                            </div>
                        )}

                        <article className="post-card-body">
                            {hasTags && (
                                <div className="post-card-tags">
                                    {post.requiresAuth && (
                                        <span className="post-card-tag">🔒 Members only</span>
                                    )}
                                    {categories.slice(0, 2).map((category) => (
                                        <span key={category.id} className="post-card-tag">
                                            {category.title}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h2 className="post-card-title">{post.title}</h2>

                            {excerpt && <p className="post-card-excerpt">{excerpt}</p>}

                            {date && (
                                <time className="post-card-meta" dateTime={post.createdAt}>
                                    {date}
                                </time>
                            )}
                        </article>
                    </Link>
                )
            })}
        </div>
    )
}

export function Pagination({
    basePath,
    page,
    totalPages,
    hasPrevPage,
    hasNextPage,
}: {
    basePath: string
    page: number
    totalPages: number
    hasPrevPage: boolean
    hasNextPage: boolean
}) {
    if (totalPages <= 1) return null

    return (
        <nav className="pagination" aria-label="Pagination">
            <Link
                href={`${basePath}?page=${page - 1}`}
                className="pagination-link"
                aria-disabled={!hasPrevPage}
                tabIndex={hasPrevPage ? undefined : -1}
            >
                ← Newer
            </Link>

            <span className="pagination-status">
                Page {page} of {totalPages}
            </span>

            <Link
                href={`${basePath}?page=${page + 1}`}
                className="pagination-link"
                aria-disabled={!hasNextPage}
                tabIndex={hasNextPage ? undefined : -1}
            >
                Older →
            </Link>
        </nav>
    )
}

export function parsePageParam(page?: string) {
    return Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
}
