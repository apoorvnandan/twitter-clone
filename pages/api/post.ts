// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
  if (req.method == "POST") {
    const post = await prisma.post.create({
      data: {
        body: req.body.txt,
        userEmail: req.body.email,
        image: req.body.image
      }
    });
    res.status(200).json({ msg: "done" })
    return
  }
  if (req.method == "GET") {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
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
    res.status(200).json({
      posts,
      userData
    })
    return
  }
  res.status(200).json({ msg: "incorrect request" })
}
