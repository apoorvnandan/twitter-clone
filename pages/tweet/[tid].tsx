import { ArrowLeftIcon, ArrowPathRoundedSquareIcon, BookmarkIcon, ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { UserType, PostType } from "@/types/common"
import Post from "@/components/PostBox"
import TweetForm from "@/components/TweetForm"

export default function Tweet() {
    const router = useRouter()
    const { data: session, status } = useSession({ required: true })
    const { tid } = router.query
    const [key, setKey] = useState<number>(0)
    const [post, setPost] = useState<PostType>()
    const [userData, setUserData] = useState<UserType>()
    const [loading, setLoading] = useState<boolean>(true)
    const [txt, setTxt] = useState<string>("")
    const [base64, setBase64] = useState<string>("")
    const [profileImage, setProfileImage] = useState<string>("/blank_pp.webp")
    const [comments, setComments] = useState<Array<PostType>>([])
    const [commentUsers, setCommentUsers] = useState<Array<UserType>>([])

    async function getComments() {
        const params = new URLSearchParams({
            tid: tid as string
        })
        const response = await fetch("/api/comment?" + params)
        if (response.status == 200) {
            const data = await response.json()
            console.log("comment tweets", data)
            setComments(data.comments)
            setCommentUsers(data.commentUsers)
        }
    }

    async function reply() {
        // make request
        const response = await fetch("/api/comment", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userEmail: session?.user?.email,
                body: txt,
                image: base64,
                parentId: tid,
            })
        })
        if (response.status == 200) {
            setKey(key + 1)
            await getComments()
        } else {
            console.log("error replying")
        }
    }

    useEffect(() => {
        async function f() {
            if (session && tid) {
                const response = await fetch(`/api/tweet/${tid}`)
                if (response.status == 200) {
                    const data = await response.json()
                    if (data.msg == "done") {
                        console.log(data)
                        setUserData(data.user)
                        setPost(data.post)
                    }
                }
                const params = new URLSearchParams({ email: session.user?.email as string })
                const currUserResponse = await fetch("/api/user?" + params)
                if (currUserResponse.status == 200) {
                    const currUser = await currUserResponse.json()
                    if (currUser.msg == "new user" || currUser.msg == "user found") {
                        setProfileImage(currUser.user.profileImage)
                    }
                }
                await getComments()
                setLoading(false)
            }
        }
        f()
    }, [tid, session])

    if (status == "loading") {
        return <div>loading...</div>
    }

    if (loading) {
        return <div className=" h-screen overflow-y-scroll flex-grow bg-black text-white">
            <div className="w-full flex">
                <div className="w-full flex flex-col lg:w-3/5 min-h-screen border-r border-neutral-600">
                    <div className="border-b border-neutral-600 p-4 flex items-center gap-4">
                        <button className="rounded-full p-2 hover:bg-white hover:bg-opacity-20" onClick={() => router.back()}><ArrowLeftIcon className="w-5 h-5" /></button>
                        <p className="text-lg font-bold">Tweet</p>
                    </div>
                    <div className="p-8 flex items-center justify-center">
                        loading...
                    </div>
                </div>
            </div>
        </div>
    }

    return <div className=" h-screen overflow-y-scroll flex-grow bg-black text-white">
        <div className="w-full flex">
            <div className="w-full flex flex-col lg:w-3/5 min-h-screen border-r border-neutral-600">
                <div className="border-b border-neutral-600 px-4 h-16 flex items-center gap-4">
                    <button className="rounded-full p-1 hover:bg-white hover:bg-opacity-20" onClick={() => router.back()}><ArrowLeftIcon className="w-5 h-5" /></button>
                    <p className="text-lg font-bold">Tweet</p>
                </div>
                {post && userData ? <Post
                    post={post}
                    userData={userData}
                    onClick={() => { }}
                    userEmail={session.user?.email as string}
                /> : null}
                <TweetForm
                    key={key}
                    txt={txt}
                    setTxt={setTxt}
                    base64={base64}
                    setBase64={setBase64}
                    onSubmit={reply}
                    label={"Reply"}
                    profileImage={profileImage}
                />
                {comments.map((comment: PostType, i: number) => <Post
                    key={comment.id}
                    post={comment}
                    userData={commentUsers[i]}
                    onClick={() => { }}
                    userEmail={session.user?.email as string}
                />)}
            </div>
        </div>
    </div>
}