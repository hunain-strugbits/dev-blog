import type { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
    slug: 'header',
    fields: [
        {
            name: 'logoText',
            type: 'text',
            required: true,
            defaultValue: 'Dev Blog'
        },
        {
            name: 'navItems',
            type: 'array',
            fields: [
                {
                    name: 'label',
                    type: 'text',
                    required: true
                },
                {
                    name: 'link',
                    type: 'text',
                    required: true
                }
            ]
        }
    ]
}