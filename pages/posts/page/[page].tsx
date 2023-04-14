// import { Inter } from 'next/font/google'
// const inter = Inter({ subsets: ['latin'] })

import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next';
import SinglePost from '../../../components/Post/SinglePost';
import { getAllPosts, getAllTags, getNumberOfPages, getPostsByPage, getPostsForTopPage } from '../../../lib/notionAPI';
import Pagination from '../../../components/Pagination/Pagination';
import Tag from '../../../components/Tag/Tag';



// 動的ページにはgetStaticPaths を書かないとエラーを吐くので注意する
export const getStaticPaths : GetStaticPaths = async () => {
  // notionAPIで作ったgetNumberOfPagesを呼び出す
  const numberOfPage = await getNumberOfPages();

  let params = [];
  for(let i = 1;  i <= numberOfPage; i++){
    params.push( { params: {page: i.toString() }  } );
  }

    return{
        paths: params,
        fallback: "blocking",
    };
};

export const getStaticProps : GetStaticProps = async (context) => {
  // const allPosts = await getAllPosts();
  // const fourPosts = await getPostsForTopPage();
  
  // オプショナルチェーンでparamsが存在しない時のエラーを回避する
  const currentPage = context.params?.page;
  // notionAPI.tsで返した値をこっちに持ってくる
  // currenPageはstring型なのでparseInt関数で整数に変換する第二引数は10進数を今回は指定する
  const postsByPage = await getPostsByPage( parseInt(currentPage.toString(), 10) );

  const numberOfPage = await getNumberOfPages();

  const allTags = await getAllTags();



  return {
    props: {
      postsByPage: postsByPage,
      numberOfPage: numberOfPage,
      allTags: allTags,
    },
    revalidate: 60,
  };
};



const BlogPageList = ( {postsByPage, numberOfPage, allTags} ) => {
  console.log(postsByPage);
  return (
    <div className="container h-full w-full mx-auto">
      <Head>
        <title>blog形式で情報を共有</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full mt-16">
        <h1 className='text-5xl font-medium text-center mb-16'>複数のページがある時に表示</h1>

        {/* allPostsで受け取ってmap関数で一つ一つ展開していく */}
        <section  className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto ">
        {postsByPage.map( (post) => (
          <div key={post.id}>
            <SinglePost
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              slug={post.slug}
              isPaginationPage={true}
            />
          </div>
        ))}
        </section>
        <Pagination numberOfPage={numberOfPage} tag={''}/>
        <Tag tags={allTags} />
      </main>

    </div>
  )
}
export default BlogPageList;