import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS_PER_PAGE, Pagination, PostGrid, parsePageParam, postListStyles } from '@/components/PostList'
import { getAuthorName } from '@/lib/authorName'

export default async function AuthorPostsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const payload = await getPayload({ config: configPromise })

    const { id } = await params
    const authorId = Number(id)
    if (!Number.isInteger(authorId)) return notFound()

    const { page } = await searchParams
    const currentPage = parsePageParam(page)

    const author = await payload
        .findByID({
            collection: 'users',
            id: authorId,
            depth: 0,
            select: { email: true },
            overrideAccess: true,
        })
        .catch(() => null)

    if (!author) return notFound()

    const posts = await payload.find({
        collection: 'Posts',
        where: { author: { equals: author.id } },
        sort: '-createdAt',
        limit: POSTS_PER_PAGE,
        page: currentPage,
    })

    if ((currentPage > 1 && currentPage > posts.totalPages) || posts.totalDocs === 0) {
        return notFound()
    }

    return (
        <main className="posts-page">
            <style>{postListStyles}</style>

            <div className="posts-container">
                <Link href="/authors" className="posts-back">
                    ← All authors
                </Link>

                <header className="posts-header">
                    <h1 className="posts-title">{getAuthorName(author.email)}</h1>
                    <p className="posts-subtitle">
                        {posts.totalDocs} {posts.totalDocs === 1 ? 'post' : 'posts'}
                    </p>
                </header>

                <PostGrid posts={posts.docs} />

                <Pagination
                    basePath={`/authors/${author.id}`}
                    page={currentPage}
                    totalPages={posts.totalPages}
                    hasPrevPage={posts.hasPrevPage}
                    hasNextPage={posts.hasNextPage}
                />
            </div>
        </main>
    )
}
