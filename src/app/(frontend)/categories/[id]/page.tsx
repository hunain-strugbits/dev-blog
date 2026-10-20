import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS_PER_PAGE, Pagination, PostGrid, parsePageParam, postListStyles } from '@/components/PostList'

export default async function CategoryPostsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const payload = await getPayload({ config: configPromise })

    const { id } = await params
    const categoryId = Number(id)
    if (!Number.isInteger(categoryId)) return notFound()

    const { page } = await searchParams
    const currentPage = parsePageParam(page)

    const category = await payload
        .findByID({ collection: 'categories', id: categoryId })
        .catch(() => null)

    if (!category) return notFound()

    const posts = await payload.find({
        collection: 'Posts',
        where: { categories: { contains: category.id } },
        sort: '-createdAt',
        limit: POSTS_PER_PAGE,
        page: currentPage,
    })

    if (currentPage > 1 && currentPage > posts.totalPages) return notFound()

    return (
        <main className="posts-page">
            <style>{postListStyles}</style>

            <div className="posts-container">
                <Link href="/categories" className="posts-back">
                    ← All categories
                </Link>

                <header className="posts-header">
                    <h1 className="posts-title">{category.title}</h1>
                    <p className="posts-subtitle">
                        {posts.totalDocs} {posts.totalDocs === 1 ? 'post' : 'posts'}
                    </p>
                </header>

                <PostGrid posts={posts.docs} />

                <Pagination
                    basePath={`/categories/${category.id}`}
                    page={currentPage}
                    totalPages={posts.totalPages}
                    hasPrevPage={posts.hasPrevPage}
                    hasNextPage={posts.hasNextPage}
                />
            </div>
        </main>
    )
}
