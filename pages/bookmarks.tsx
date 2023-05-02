import { PostType, UserType } from "@/types/common";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Post from "@/components/PostBox";

export default function Bookmarks() {
    const router = useRouter()
    const { data: session, status } = useSession({ required: true })
    // const [profileImage, setProfileImage] = useState<string>("/blank_pp.webp")
    // const [name, setName] = useState<string>("")
    // const [username, setUsername] = useState<string>("")
    const [tweetLoading, setTweetLoading] = useState<boolean>(true)
    const [posts, setPosts] = useState<Array<PostType>>([])
    const [userData, setUserData] = useState<Array<UserType>>([])

    async function getUserTweets() {
        setTweetLoading(true)
        const params = new URLSearchParams({
            email: session?.user?.email as string
        })
        const response = await fetch("/api/bookmark?" + params)
        if (response.status == 200) {
            const data = await response.json()
            setPosts(data.posts)
            setUserData(data.userData)
            setTweetLoading(false)
        }
    }

    useEffect(() => {
        async function f() {
            if (status != "loading" && session) {
                const params = new URLSearchParams({
                    email: session.user?.email as string,
                })
                const response = await fetch("/api/user?" + params)
                const data = await response.json()
                console.log('user response', data)
                if (data.msg == "new user" || data.msg == "user found") {
                    // setProfileImage(data.user.profileImage)
                    // setUsername(data.user.username)
                    // setName(data.user.name)
                    await getUserTweets()
                }
            }
        }
        f()
    }, [status, session])

    if (status == "loading") {
        return <div>Loading...</div>
    }

    return <div className=" h-screen overflow-y-scroll flex-grow bg-black text-white">
        <div className="w-full flex">
            <div className="w-full flex flex-col lg:w-3/5 min-h-screen border-r border-neutral-600">
                <div className="border-b border-neutral-600 px-4 h-16 flex items-center gap-4">
                    <button className="rounded-full p-1 hover:bg-white hover:bg-opacity-20" onClick={() => router.back()}><ArrowLeftIcon className="w-5 h-5" /></button>
                    <p className="text-lg font-bold">Bookmarks</p>
                </div>
                {tweetLoading ?
                    <div className="h-16 flex items-center justify-center">Loading...</div>
                    :
                    posts.map((post: PostType, i: number) => <Post
                        key={post.id}
                        post={post}
                        userData={userData[i]}
                        onClick={() => router.push(`/tweet/${post.id}`)}
                        userEmail={session.user?.email as string}
                    />)
                }
            </div>
        </div>
    </div>
}