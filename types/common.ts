export type PostType = {
    id: string
    body: string
    image?: string
    createdAt: string
    updatedAt: string
    likedUserEmails: string[]
    bookmarkedUserEmails: string[]
    userEmail: string
    parentId?: string
    commentIds: string[]
}

export type UserType = {
    id: string
    name: string
    username: string
    profileImage: string
    createdAt: string
    updatedAt: string
    email: string
}