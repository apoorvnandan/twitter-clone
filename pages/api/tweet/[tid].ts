import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    const { tid } = req.query
    const post = await prisma.post.findUnique({
        where: {
            id: tid as string
        }
    })
    if (post) {
        const user = await prisma.user.findUnique({
            where: {
                email: post.userEmail
            }
        })
        if (user) {
            res.status(200).json({ msg: "done", post, user })
            return
        }
        res.status(200).json({ msg: "post found. user not found" })
    } else {
        res.status(200).json({ msg: "post not found" })
    }
}