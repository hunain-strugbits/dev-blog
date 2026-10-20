import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { postListStyles } from '@/components/PostList'

export default async function CategoriesPage() {
    const payload = await getPayload({ config: configPromise })

    const categories = await payload.find({
        collection: 'categories',
        sort: 'title',
        limit: 0,
        pagination: false,
    })

    const withCounts = await Promise.all(
        categories.docs.map(async (category) => {
            const { totalDocs } = await payload.count({
                collection: 'Posts',
                where: { categories: { contains: category.id } },
            })
            return { category, count: totalDocs }
        }),
    )

    return (
        <main className="posts-page">
            <style>{postListStyles}</style>

            <div className="posts-container">
                <header className="posts-header">
                    <h1 className="posts-title">Categories</h1>
                    <p className="posts-subtitle">Browse posts by topic</p>
                </header>

                {withCounts.length === 0 ? (
                    <p className="posts-empty">No categories yet.</p>
                ) : (
                    <div className="term-grid">
                        {withCounts.map(({ category, count }) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="term-card"
                            >
                                <span className="term-card-name">{category.title}</span>
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
