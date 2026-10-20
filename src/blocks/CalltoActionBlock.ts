import type { Block } from "payload";

export const CallToActionBlock: Block = {
    slug: 'callToAction',
    fields: [
        {
            name: 'text',
            type: 'text',
            required: true
        },
        {
            name: 'buttonLabel',
            type: 'text',
            required: true
        },
        {
            name: 'buttonLink',
            type: 'text',
            required: true
        }
    ]
}
