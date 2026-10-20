import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
    slug: "Posts",
    admin: {
        useAsTitle: 'title',
    },
    access: {
        read: () => true,

        create: ({ req: { user }}) => {
            return Boolean(user)
        },

        update: ({ req: { user }}) => {
            if (!user) return false

            return {
                author: {
                    equals: user.id
                }
            }
        },

        delete: ({ req: { user } }) => {
            if (!user) return false

            return { author: { equals: user.id }}
        }
    },
    hooks: {
        beforeChange: [
            ({ req, operation, data }) => {
                if (operation === 'create' && req.user) {
                    data.author = req.user.id

                    if (data && data.title) {
                        data.slug = data.title.replace(' ', '-').toLowerCase()
                    }
                }

                return data
            }
        ]
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'coverImage',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            admin: {
                position: 'sidebar'
            }
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar'
            }
        },
        {
            name: 'isFeatured',
            type: 'checkbox',
        },
        {
            name: 'requiresAuth',
            type: 'checkbox',
            admin: {
                position: 'sidebar',
                description: 'Only logged-in users can read this post'
            }
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'users',
            required: false,
            admin: {
                position: 'sidebar',
                readOnly: true
            }
        },
        {
            name: 'content',
            type: 'richText'
        }
    ]
}