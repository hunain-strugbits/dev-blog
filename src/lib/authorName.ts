// Users only have an email, so the public display name is its local part
export function getAuthorName(email: string) {
    return email.split('@')[0]
}
