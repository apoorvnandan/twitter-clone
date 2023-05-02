import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from "@/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    if (req.method == "GET") {
        const posts = await prisma.post.findMany({
            where: {
                bookmarkedUserEmails: {
                    has: req.query.email as string
                }
            }
        })
        const userData = []
        for (let i = 0; i < posts.length; i++) {
            const user = await prisma.user.findUnique({
                where: {
                    email: posts[i].userEmail
                }
            })
            userData.push(user)
        }
        console.log(posts)
        res.status(200).json({ msg: "done", posts, userData })
        return
    }
    if (req.method == "POST") {
        console.log(req.body)
        const post = await prisma.post.update({
            where: {
                id: req.body.id
            },
            data: {
                bookmarkedUserEmails: req.body.bookmarkedUserEmails
            }
        })
        res.status(200).json({ msg: "done", post })
        return
    }
    res.status(400).json({ msg: "invalid request   " })
}