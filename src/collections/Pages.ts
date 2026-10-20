import type { CollectionConfig } from 'payload'
import { HeroBlock } from '@/blocks/HeroBlock'
import { CallToActionBlock } from '@/blocks/CalltoActionBlock'

export const Pages: CollectionConfig = {
    slug: 'pages',
    versions: { drafts: true },
    admin: {
        useAsTitle: 'title',

        livePreview: {
            url: ({ data }) => {
                return data.slug === 'home'
                    ? 'http://localhost:3000/'
                    : `http://localhost:3000/${data.slug}`
            }
        }
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: { position: 'sidebar' }
        },
        {
            name: 'layout',
            type: 'blocks',
            blocks: [HeroBlock, CallToActionBlock]
        }
    ]
}