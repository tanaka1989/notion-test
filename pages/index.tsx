// import { Inter } from 'next/font/google'
// const inter = Inter({ subsets: ['latin'] })

import Head from 'next/head'
import { getAllPosts, getAllTags, getPostsForTopPage } from '../lib/notionAPI'
import SinglePost from '../components/Post/SinglePost';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Tag from '../components/Tag/Tag';

export const getStaticProps : GetStaticProps = async () => {
  // const allPosts = await getAllPosts();
  // notionAPI.tsで返した値をこっちに持ってくる
  const fourPosts = await getPostsForTopPage();

  const allTags = await getAllTags();


  return {
    props: {
      fourPosts: fourPosts,
      allTags: allTags,
    },
    revalidate: 60,
  };
};



export default function Home( {fourPosts, allTags} ) {
  console.log(fourPosts);
  return (
    <div className="container h-full w-full mx-auto">
      <Head>
        <title>ブログ系情報共有サイト</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full mt-16">
        <h1 className='text-5xl font-medium text-center mb-16'>blog形式で情報を共有</h1>

        {/* allPostsで受け取ってmap関数で一つ一つ展開していく */}
        {fourPosts.map( (post) => (
          <div className="mx-4" key={post.id}>
            <SinglePost
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              slug={post.slug}
              isPaginationPage={false}
            />
          </div>
        ))}

        <Link href="/posts/page/1" 
              className='mb-6 lg:w-1/2 mx-auto rounded-md px-5 block text-right'>...もっと見る
        </Link>

        <Tag tags={allTags}/>
      </main>

    </div>
  )
}
