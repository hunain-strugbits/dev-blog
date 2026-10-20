import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'

const styles = `
  .home-page {
    --fg: #111827;
    --muted: #6b7280;
    --bg: #ffffff;
    --surface: #f3f4f6;
    --border: #e5e7eb;
    --accent: #0070f3;
    --accent-hover: #005bc4;
    --hero-bg: #111827;
    --hero-fg: #ffffff;
    --hero-muted: #d1d5db;
    color: var(--fg);
    background: var(--bg);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .home-page {
      --fg: #f3f4f6;
      --muted: #9ca3af;
      --bg: #0b0f19;
      --surface: #111827;
      --border: #1f2937;
      --accent: #3b82f6;
      --accent-hover: #60a5fa;
      --hero-bg: #030712;
    }
  }

  .block-inner {
    max-width: 960px;
    margin: 0 auto;
  }

  /* Hero */
  .hero {
    background: var(--hero-bg);
    color: var(--hero-fg);
    padding: clamp(4rem, 12vw, 8rem) 1.5rem;
    text-align: center;
  }
  .hero-heading {
    max-width: 18ch;
    margin: 0 auto;
    font-size: clamp(2.25rem, 6vw, 4rem);
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .hero-subheading {
    max-width: 60ch;
    margin: 1.5rem auto 0;
    font-size: clamp(1.0625rem, 2.2vw, 1.375rem);
    line-height: 1.6;
    color: var(--hero-muted);
  }

  /* Featured posts */
  .featured {
    padding: clamp(3rem, 8vw, 5rem) 1.5rem;
  }
  .featured-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .featured-title {
    margin: 0;
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .featured-all {
    flex-shrink: 0;
    color: var(--accent);
    font-size: 0.9375rem;
    font-weight: 500;
    text-decoration: none;
  }
  .featured-all:hover { text-decoration: underline; }

  .featured-grid {
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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }
  .post-card-meta {
    margin-top: auto;
    padding-top: 0.5rem;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  /* Call to action */
  .cta {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: clamp(3rem, 8vw, 5rem) 1.5rem;
    text-align: center;
  }
  .cta-text {
    max-width: 28ch;
    margin: 0 auto 1.75rem;
    font-size: clamp(1.5rem, 3.5vw, 2.25rem);
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .cta-button {
    display: inline-block;
    padding: 0.875rem 1.75rem;
    background: var(--accent);
    color: #fff;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }
  .cta-button:hover { background: var(--accent-hover); }
  .cta-button:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }

  /* Empty state */
  .empty {
    max-width: 480px;
    margin: 6rem auto;
    padding: 2.5rem 1.5rem;
    text-align: center;
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .empty h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  .empty p { margin: 0; color: var(--muted); line-height: 1.6; }
  .empty code {
    background: var(--surface);
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
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

export default async function HomePage() {
    const payload = await getPayload({ config: configPromise })

    // 1. Fetch the page where the slug is exactly 'home'
    const pages = await payload.find({
        collection: 'pages',
        where: {
            slug: { equals: 'home' },
        },
        limit: 1,
    })

    const page = pages.docs[0]

    // 2. If the 'home' page hasn't been created in the admin UI yet, show a helpful message
    if (!page) {
        return (
            <main className="home-page">
                <style>{styles}</style>
                <div className="empty">
                    <h1>No home page found</h1>
                    <p>
                        Open the admin panel and create a page with the slug <code>home</code>.
                    </p>
                </div>
            </main>
        )
    }

    // 3. Fetch the featured posts (newest first, max 3)
    const featured = await payload.find({
        collection: 'Posts',
        where: {
            isFeatured: { equals: true },
        },
        sort: '-createdAt',
        limit: 3,
    })

    const featuredSection =
        featured.docs.length > 0 ? (
            <section key="featured-posts" className="featured">
                <div className="block-inner">
                    <div className="featured-header">
                        <h2 className="featured-title">Featured posts</h2>
                        <Link href="/posts" className="featured-all">
                            See all posts
                        </Link>
                    </div>

                    <div className="featured-grid">
                        {featured.docs.map((post) => {
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
                                        {categories.length > 0 && (
                                            <div className="post-card-tags">
                                                {categories.slice(0, 2).map((category) => (
                                                    <span key={category.id} className="post-card-tag">
                                                        {category.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <h3 className="post-card-title">{post.title}</h3>

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
                </div>
            </section>
        ) : null

    // Featured posts go between the hero and the call to action:
    // right before the first CTA block, or at the end if there isn't one.
    const layout = page.layout ?? []
    const ctaIndex = layout.findIndex((block) => block.blockType === 'callToAction')

    // 4. Render the blocks
    return (
        <main className="home-page">
            <style>{styles}</style>

            {layout.map((block, index) => {
                const key = block.id ?? index

                switch (block.blockType) {
                    case 'hero':
                        return (
                            <section key={key} className="hero">
                                <div className="block-inner">
                                    <h1 className="hero-heading">{block.heading}</h1>
                                    {block.subheading && (
                                        <p className="hero-subheading">{block.subheading}</p>
                                    )}
                                </div>
                            </section>
                        )

                    case 'callToAction':
                        return (
                            <div key={key}>
                                {index === ctaIndex && featuredSection}
                                <section className="cta">
                                    <div className="block-inner">
                                        <h2 className="cta-text">{block.text}</h2>
                                        <Link href={block.buttonLink} className="cta-button">
                                            {block.buttonLabel}
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        )

                    default:
                        return null
                }
            })}

            {ctaIndex === -1 && featuredSection}
        </main>
    )
}