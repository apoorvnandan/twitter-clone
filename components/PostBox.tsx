import { ArrowPathRoundedSquareIcon, BookmarkIcon, ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid"
import Image from "next/image";
import { UserType, PostType } from "@/types/common";
import { useState } from "react";

export default function Post({ post, userData, onClick, userEmail }: {
    post: PostType,
    userData: UserType,
    onClick: () => void,
    userEmail: string
}) {
    const [likedEmails, setLikedEmails] = useState<Array<string>>(post.likedUserEmails)
    const [bookmarkedEmails, setBookmarkedEmails] = useState<Array<string>>(post.bookmarkedUserEmails)

    function isLiked() {
        return likedEmails.includes(userEmail)
    }

    function isBookmarked() {
        return bookmarkedEmails.includes(userEmail)
    }

    async function like() {
        let newLikedUserEmails = []
        if (post.likedUserEmails.includes(userEmail)) {
            newLikedUserEmails = post.likedUserEmails.filter(email => email != userEmail)
        } else {
            newLikedUserEmails = [...post.likedUserEmails, userEmail]
        }
        setLikedEmails(newLikedUserEmails)
        const response = await fetch("/api/like", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                likedUserEmails: newLikedUserEmails
            })
        })
        if (response.status == 200) {
            const data = await response.json()
            if (data.msg == "done") {
                setLikedEmails(data.post.likedUserEmails)
            }
        }
    }
    async function bookmark() {
        let newBookmarkedEmails = []
        if (post.bookmarkedUserEmails.includes(userEmail)) {
            newBookmarkedEmails = post.bookmarkedUserEmails.filter(email => email != userEmail)
        } else {
            newBookmarkedEmails = [...post.bookmarkedUserEmails, userEmail]
        }
        setBookmarkedEmails(newBookmarkedEmails)
        const response = await fetch("/api/bookmark", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                bookmarkedUserEmails: newBookmarkedEmails
            })
        })
        if (response.status == 200) {
            const data = await response.json()
            if (data.msg == "done") {
                setBookmarkedEmails(data.post.bookmarkedUserEmails)
            }
        }
    }

    return <div onClick={onClick} className="p-4 border-b border-neutral-600 flex">
        <div className='shrink-0 grow-0 w-16 mr-2 flex flex-col items-center'>
            <Image
                className='rounded-full h-12 w-12'
                src={userData?.profileImage as string}
                alt='tweet user pic'
                height={500}
                width={500}
            />
        </div>
        <div className='flex-grow'>
            <p className='font-bold'>{userData?.name} <span className='font-normal text-neutral-400 ml-2'>@{userData?.username}</span></p>
            <div className='mb-2' dangerouslySetInnerHTML={{ __html: post?.body as string }}></div>
            {post?.image != "" && <Image
                className='w-full rounded-xl'
                src={post?.image as string}
                width={1000}
                height={1000}
                alt='tweet image'
            />}
            <div className='flex gap-12 pt-4'>
                <button className='flex items-center gap-2 hover:text-blue-500'><ChatBubbleLeftIcon className='h-5 w-5' />{post.commentIds.length}</button>
                <button className='flex items-center gap-2 hover:text-blue-500'><ArrowPathRoundedSquareIcon className='h-5 w-5' />{0}</button>
                <button onClick={async (e) => { e.stopPropagation(); await like() }} className='flex items-center gap-2 hover:text-blue-500'>{isLiked() ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className='h-5 w-5' />}{likedEmails.length}</button>
                <button onClick={async (e) => { e.stopPropagation(); await bookmark() }} className='flex items-center gap-2 hover:text-blue-500'>{isBookmarked() ? <BookmarkSolidIcon className="h-5 w-5" /> : <BookmarkIcon className='h-5 w-5' />}{bookmarkedEmails.length}</button>
            </div>
        </div>
    </div>
}