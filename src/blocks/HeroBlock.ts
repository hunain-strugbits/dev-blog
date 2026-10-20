import type { Block } from 'payload'

export const HeroBlock: Block = {
    slug: 'hero',
    fields: [
        {
            name: 'heading',
            type: 'text',
            required: true
        },
        {
            name: 'subheading',
            type: 'text'
        },
        {
            name: 'backgroundImage',
            type: 'upload',
            relationTo: 'media'
        }
    ]
}