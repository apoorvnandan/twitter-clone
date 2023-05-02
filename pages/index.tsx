import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import Post from '@/components/PostBox';
import { PostType, UserType } from '@/types/common';
import TweetForm from '@/components/TweetForm';

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession({ required: true })
  const [key, setKey] = useState<number>(0)
  const [base64, setBase64] = useState<string>('');
  const [txt, setTxt] = useState<string>('')
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [userData, setUserData] = useState<Array<UserType>>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("/blank_pp.webp")

  function handleDrop(files: File[]) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (event: any) => {
      setBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function tweet() {
    const response = await fetch("/api/post", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        txt: txt,
        email: session?.user?.email,
        image: base64
      })
    })
    if (response.status == 200) {
      setKey(key + 1)
    }
    await getTweets()

  }

  async function getTweets() {
    const response = await fetch("/api/post")
    const data = await response.json()
    console.log('tweets', data)
    setPosts(data.posts.filter((post: PostType) => !post.parentId))
    setUserData(data.userData)
  }

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: handleDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    }
  });

  function makeid(length: number) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  useEffect(() => {
    async function f() {
      if (status != "loading" && session) {
        // setLoadingPosts(true)
        const params = new URLSearchParams({
          email: session.user?.email as string,
          name: session.user?.name as string,
          username: session.user?.name?.split(' ')[0] + '_' + makeid(6) as string
        })
        const response = await fetch("/api/user?" + params)
        const data = await response.json()
        console.log('user response', data)
        if (data.msg == "new user" || data.msg == "user found") {
          setProfileImage(data.user.profileImage)
        }

        await getTweets()
        setLoadingPosts(false)
      }
    }
    f()
  }, [status, session])

  if (status == "loading") {
    return <div>Loading...</div>
  }

  return (
    <>
      <Modal open={profileOpen} setOpen={setProfileOpen} />
      <div className=" h-screen overflow-y-scroll flex-grow bg-black text-white">
        <div className='sticky top-0 backdrop-blur-sm z-10 lg:w-3/5 w-full h-16 flex items-center border-b border-r border-neutral-600 px-4'>
          <h1 className='text-lg font-bold'>Home</h1>
        </div>
        <div className='relative w-full flex -top-16'>
          <div className='w-full lg:w-3/5 grow-0 shrink-0'>
            <div className='flex flex-col pt-16 min-h-screen border-r border-neutral-600'>
              <TweetForm
                key={key}
                txt={txt}
                setTxt={setTxt}
                base64={base64}
                setBase64={setBase64}
                onSubmit={tweet}
                label="Tweet"
                profileImage={profileImage}
              />
              {loadingPosts ? <div className='flex justify-center p-8'>
                <div className='border-2 w-5 h-5 border-white border-t-transparent animate-spin rounded-full'></div>
              </div> : posts.map((post: any, i: number) => (
                <Post
                  key={post.id}
                  onClick={() => router.push(`/tweet/${post.id}`)}
                  post={post}
                  userData={userData[i]}
                  userEmail={session.user?.email as string}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
