import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const POSTS_PER_PAGE = 9

const styles = `
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

export default async function AllPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const payload = await getPayload({ config: configPromise })

    const { page } = await searchParams
    const currentPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)

    const posts = await payload.find({
        collection: 'Posts',
        sort: '-createdAt',
        limit: POSTS_PER_PAGE,
        page: currentPage,
    })

    // A page number past the end (e.g. /posts?page=99) is a 404
    if (currentPage > 1 && currentPage > posts.totalPages) return notFound()

    return (
        <main className="posts-page">
            <style>{styles}</style>

            <div className="posts-container">
                <header className="posts-header">
                    <h1 className="posts-title">All posts</h1>
                    <p className="posts-subtitle">
                        {posts.totalDocs} {posts.totalDocs === 1 ? 'post' : 'posts'}
                    </p>
                </header>

                {posts.docs.length === 0 ? (
                    <p className="posts-empty">No posts yet. Check back soon.</p>
                ) : (
                    <div className="posts-grid">
                        {posts.docs.map((post) => {
                            const categories = (post.categories ?? []).filter(
                                (category): category is Exclude<typeof category, string | number> =>
                                    typeof category === 'object' && category !== null,
                            )
                            const cover =
                                post.coverImage &&
                                typeof post.coverImage === 'object' &&
                                post.coverImage.url
                                    ? post.coverImage
                                    : null
                            const excerpt = getExcerpt(post.content)
                            const date = formatDate(post.createdAt)
                            const hasTags = categories.length > 0 || post.requiresAuth

                            return (
                                <Link
                                    key={post.id}
                                    href={`/posts/${post.slug}`}
                                    className="post-card"
                                >
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
                )}

                {posts.totalPages > 1 && (
                    <nav className="pagination" aria-label="Pagination">
                        <Link
                            href={`/posts?page=${currentPage - 1}`}
                            className="pagination-link"
                            aria-disabled={!posts.hasPrevPage}
                            tabIndex={posts.hasPrevPage ? undefined : -1}
                        >
                            ← Newer
                        </Link>

                        <span className="pagination-status">
                            Page {posts.page} of {posts.totalPages}
                        </span>

                        <Link
                            href={`/posts?page=${currentPage + 1}`}
                            className="pagination-link"
                            aria-disabled={!posts.hasNextPage}
                            tabIndex={posts.hasNextPage ? undefined : -1}
                        >
                            Older →
                        </Link>
                    </nav>
                )}
            </div>
        </main>
    )
}