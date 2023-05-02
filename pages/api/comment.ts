import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    try {
        if (req.method == "GET") {
            const tid = req.query.tid as string
            const comments = await prisma.post.findMany({
                where: {
                    parentId: tid
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            let commentUsers = []
            for (let i = 0; i < comments.length; i++) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: comments[i].userEmail
                    }
                })
                commentUsers.push(user)
            }
            res.status(200).json({ msg: "done", comments, commentUsers })
            return
        }
        if (req.method == "POST") {
            const comment = await prisma.post.create({
                data: req.body
            })
            res.status(200).json({ msg: "done" })
            return
        }
    } catch (error) {
        console.log(error)
        res.status(200).json({ msg: "error" })
    }

}