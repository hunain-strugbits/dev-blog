import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
    slug: 'comments',
    admin: {
        useAsTitle: 'body',
        defaultColumns: ['body', 'authorName', 'post', 'createdAt'],
    },
    access: {
        read: () => true,

        create: ({ req: { user } }) => Boolean(user),

        update: ({ req: { user } }) => {
            if (!user) return false

            return { author: { equals: user.id } }
        },

        delete: ({ req: { user } }) => {
            if (!user) return false

            return { author: { equals: user.id } }
        },
    },
    hooks: {
        beforeChange: [
            ({ req, operation, data }) => {
                if (operation === 'create' && req.user) {
                    data.author = req.user.id
                    data.authorName = req.user.email.split('@')[0]
                }

                return data
            },
        ],
    },
    fields: [
        {
            name: 'post',
            type: 'relationship',
            relationTo: 'Posts',
            required: true,
            index: true,
        },
        {
            name: 'body',
            type: 'textarea',
            required: true,
            maxLength: 1000,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
        {
            name: 'authorName',
            type: 'text',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
        },
    ],
}
