import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const payload = await getPayload({ config: configPromise })
  const { slug } = await params

  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })


  const pages = await payload.find({
    collection: 'pages',

    draft: user ? true : false,

    where: { slug: { equals: slug } },
  })

  const page = pages.docs[0]
  if (!page) return notFound()

  return (
    <main>
      {page.layout?.map((block, index) => {
        switch (block.blockType) {
          
          case 'hero':
            return (
              <section key={index} style={{ padding: '6rem 2rem', background: '#333', color: '#fff', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>{block.heading}</h1>
                {block.subheading && <p style={{ fontSize: '1.5rem' }}>{block.subheading}</p>}
              </section>
            )
            
          case 'callToAction':
            return (
              <section key={index} style={{ padding: '4rem 2rem', background: '#eee', textAlign: 'center' }}>
                <h2>{block.text}</h2>
                <Link href={block.buttonLink}>
                  <button style={{ padding: '1rem 2rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {block.buttonLabel}
                  </button>
                </Link>
              </section>
            )
            
          default:
            return <div key={index}>Unknown block</div>
        }
      })}
    </main>
  )
}