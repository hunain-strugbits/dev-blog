import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { POSTS_PER_PAGE, Pagination, PostGrid, parsePageParam, postListStyles } from '@/components/PostList'

export default async function AllPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const payload = await getPayload({ config: configPromise })

    const { page } = await searchParams
    const currentPage = parsePageParam(page)

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
            <style>{postListStyles}</style>

            <div className="posts-container">
                <header className="posts-header">
                    <h1 className="posts-title">All posts</h1>
                    <p className="posts-subtitle">
                        {posts.totalDocs} {posts.totalDocs === 1 ? 'post' : 'posts'}
                    </p>
                </header>

                <PostGrid posts={posts.docs} />

                <Pagination
                    basePath="/posts"
                    page={currentPage}
                    totalPages={posts.totalPages}
                    hasPrevPage={posts.hasPrevPage}
                    hasNextPage={posts.hasNextPage}
                />
            </div>
        </main>
    )
}
