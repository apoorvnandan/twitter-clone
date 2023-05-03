import { PostType, UserType } from "@/types/common";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Post from "@/components/PostBox";

export default function Profile() {
    const router = useRouter()
    const { data: session, status } = useSession({ required: true })
    const [profileImage, setProfileImage] = useState<string>("/blank_pp.webp")
    const [name, setName] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [sending, setSending] = useState<boolean>(false)
    const [tweetLoading, setTweetLoading] = useState<boolean>(true)
    const [posts, setPosts] = useState<Array<PostType>>([])
    const [userData, setUserData] = useState<Array<UserType>>([])

    function handleDrop(files: File[]) {
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (event: any) => {
            setProfileImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }

    async function onSave() {
        if (session && session.user) {
            setSending(true)
            const response = await fetch("/api/user", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: session.user.email,
                    profileImage,
                })
            })
            if (response.status == 200) {
                const data = await response.json()
                if (data.msg == "done") {
                    setProfileImage(data.user.profileImage)
                    setSending(false)
                    await getUserTweets()
                    return
                }
            }
            setProfileImage("/blank_pp.webp")
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 1,
        onDrop: handleDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
        }
    });

    async function getUserTweets() {
        setTweetLoading(true)
        const params = new URLSearchParams({
            email: session?.user?.email as string
        })
        const response = await fetch("/api/tweet/user?" + params)
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
                    setProfileImage(data.user.profileImage)
                    setUsername(data.user.username)
                    setName(data.user.name)
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
                    <p className="text-lg font-bold">Profile</p>
                </div>
                <div className="border-b border-neutral-600 p-4">
                    <div className="relative mb-8 flex justify-between">
                        <div {...getRootProps({ className: 'absolute top-9 left-9 hover:bg-neutral-900 hover:bg-opacity-30 rounded-full p-2 cursor-pointer w-fit' })}>
                            <input {...getInputProps()} />
                            <CameraIcon className="h-6 w-6 text-white " />
                        </div>

                        <Image
                            className="w-28 h-28 rounded-full"
                            src={profileImage}
                            alt="profile image"
                            height={500}
                            width={500}
                        />
                        <button onClick={onSave} className="w-24 h-10 flex items-center justify-center bg-blue-500 self-start rounded-full">
                            {sending ? <div className='border-2 w-5 h-5 border-white border-t-transparent animate-spin rounded-full'></div> : "Save"}
                        </button>
                    </div>
                    <div>
                        <p className="text-xl font-bold mb-1">{name}</p>
                        <p className="text-neutral-400">@{username}</p>
                    </div>
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