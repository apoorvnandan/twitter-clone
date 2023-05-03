// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from "@/lib/prisma";
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' // Set desired value here
        }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    try {
        if (req.method == "GET") {
            const email = req.query.email as string
            if (email) {
                const currentUser = await prisma.user.findUnique({
                    where: {
                        email: email,
                    }
                });

                if (!currentUser) {
                    const user = await prisma.user.create({
                        data: {
                            email: email,
                            username: req.query.username as string,
                            profileImage: "/blank_pp.webp",
                            name: req.query.name as string
                        }
                    });
                    res.status(200).json({ msg: "new user", user })
                    return
                }
                res.status(200).json({ msg: 'user found', user: currentUser })
                return
            }
            res.status(200).json({ msg: "no email sent" })
            return
        }
        if (req.method == "POST") {
            const email = req.body.email as string
            if (email) {
                const currentUser = await prisma.user.findUnique({
                    where: {
                        email: email,
                    }
                });
                if (!currentUser) {
                    const user = await prisma.user.create({
                        data: req.body
                    });
                    res.status(200).json({ msg: "done", user })
                } else {
                    const user = await prisma.user.update({
                        where: {
                            email: email
                        },
                        data: req.body
                    })
                    res.status(200).json({ msg: "done", user })
                }
                return
            }
            res.status(200).json({ msg: 'no email sent' })
            return
        }
        res.status(200).json({ msg: "invalid request type" })
    } catch (e) {
        res.status(200).json({ msg: "error" })
    }
}
