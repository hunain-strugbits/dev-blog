import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { postListStyles } from '@/components/PostList'
import { getAuthorName } from '@/lib/authorName'

export default async function AuthorsPage() {
    const payload = await getPayload({ config: configPromise })

    // Users are not publicly readable, so read them directly and expose only id + email
    const users = await payload.find({
        collection: 'users',
        sort: 'email',
        limit: 0,
        pagination: false,
        depth: 0,
        select: { email: true },
        overrideAccess: true,
    })

    const withCounts = await Promise.all(
        users.docs.map(async (user) => {
            const { totalDocs } = await payload.count({
                collection: 'Posts',
                where: { author: { equals: user.id } },
            })
            return { user, count: totalDocs }
        }),
    )

    const authors = withCounts.filter(({ count }) => count > 0)

    return (
        <main className="posts-page">
            <style>{postListStyles}</style>

            <div className="posts-container">
                <header className="posts-header">
                    <h1 className="posts-title">Authors</h1>
                    <p className="posts-subtitle">Browse posts by writer</p>
                </header>

                {authors.length === 0 ? (
                    <p className="posts-empty">No authors yet.</p>
                ) : (
                    <div className="term-grid">
                        {authors.map(({ user, count }) => (
                            <Link key={user.id} href={`/authors/${user.id}`} className="term-card">
                                <span className="term-card-name">{getAuthorName(user.email)}</span>
                                <span className="term-card-count">
                                    {count} {count === 1 ? 'post' : 'posts'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
