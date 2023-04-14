import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllTags, getNumberOfPages, getNumberOfPagesByTag, getPostByTagAndPage, getPostsByPage } from '../../../../../lib/notionAPI';
import SinglePost from '../../../../../components/Post/SinglePost';
import Pagination from '../../../../../components/Pagination/Pagination';
import Tag from '../../../../../components/Tag/Tag';
// import SinglePost from '../../../components/Post/SinglePost';
// import { getAllPosts, getNumberOfPages, getPostsByPage, getPostsForTopPage } from '../../../lib/notionAPI';
// import Pagination from '../../../components/Pagination/Pagination';



// 動的ページにはgetStaticPaths を書かないとエラーを吐くので注意する
export const getStaticPaths : GetStaticPaths = async () => {
  // notionAPIで作ったgetNumberOfPagesByTagを呼び出す
  const allTags = await getAllTags();
  let params = [];

  await Promise.all(
    allTags.map((tag: string) => {
      return getNumberOfPagesByTag(tag).then((numberOfPagesByTag: number) => {
        for (let i = 1; i <= numberOfPagesByTag; i++) {
          params.push({ params: { tag: tag, page: i.toString() } });
        }
      });
    })
  );

  console.log(params);

  return {
    paths: params,
    fallback: "blocking",
  };
};

export const getStaticProps : GetStaticProps = async (context) => {
  // const allPosts = await getAllPosts();
  // const fourPosts = await getPostsForTopPage();
  
  // オプショナルチェーンでparamsが存在しない時のエラーを回避する
  const currentPage:string = context.params?.page.toString();
  const currentTag:string = context.params?.tag.toString();

  const upperCaseCurrentTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);
  
  // notionAPI.tsで返した値をこっちに持ってくる
  // currenPageはstring型なのでparseInt関数で整数に変換する第二引数は10進数を今回は指定する


//   const postsByPage = await getPostsByPage( parseInt(currentPage.toString(), 10) );
//   const numberOfPage = await getNumberOfPages();


const posts = await getPostByTagAndPage( currentTag,upperCaseCurrentTag, parseInt(currentPage, 10) );


const numberOfPagesByTag = await getNumberOfPagesByTag(upperCaseCurrentTag);

const allTags = await getAllTags();


  return {
    props: {
      posts: posts,
      numberOfPagesByTag,
      currentTag,
      allTags,
    },
    revalidate: 60,
  };
};



const BlogTagPageList = ( {numberOfPagesByTag, posts, currentTag, allTags} ) => {
  console.log(posts);
  return (
    <div className="container h-full w-full mx-auto">
      <Head>
        <title>blog形式コミュニティサイト</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full mt-16">
        <h1 className='text-5xl font-medium text-center mb-16'>タグ検索</h1>

        {/* allPostsで受け取ってmap関数で一つ一つ展開していく */}
        <section  className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto ">
        {posts.map( (post) => (
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
        <Pagination numberOfPage={numberOfPagesByTag} tag={currentTag}/>
      </main>
      <Tag tags={allTags} />
    </div>
  )
}
export default BlogTagPageList;