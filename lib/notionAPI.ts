import { Client } from "@notionhq/client";
import { NotionToMarkdown  } from "notion-to-md"
import { NUMBER_OF_POSTS_PER_PAGE } from "../constants/constants";

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// インスタンス化する
// https://www.npmjs.com/package/notion-to-md
// から引用
const n2m = new NotionToMarkdown({ notionClient: notion });


// https://www.npmjs.com/package/@notionhq/client
// ここのエラー処理の部分(Handling errors)から引用

// 投稿結果の全てを取得する関数
export const getAllPosts =async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATEBASE_ID,
    page_size: 100,
    filter:{
      property: "public",
      checkbox:{
          equals: true,
        },
      },
    sorts:[
      {
        property: "Date",
        direction: "descending",
      },
    ]
  });
   // postの全ての結果を取得して、retrunで返す
  const allPosts = posts.results;

  //map関数を使って取得したまるごとのデータを一つ一つ取得する
  return allPosts.map( (post) => {
    return getPageMetaData(post);
  });
};


//メタデータの関数を作成して対象の要素を取得する(propertiesの中のnameの中のtitleの中の0番目のプレーンテキスト等を)
//取ってくる
//ページ毎の一つ一つをmap関数で取得したので、それをメタデータ関数でmap関数でバラした要素を返すようなものを作る
const getPageMetaData = (post) => {

  // このままtagsを取得すると配列の中身全てを取得してしまうので
  // map関数で配列の中身を単体で取得する
  const getTags = (tags) => {
    const allTags =tags.map( (tag) => {
      return tag.name;
    } );
    return allTags;
  };
  
  return{
    id: post.id,
    title: post.properties.Name.title[0].plain_text,
    description: post.properties.Description.rich_text[0].plain_text,
    date: post.properties.Date.date.start,
    slug: post.properties.Slug.rich_text[0].plain_text,
    tags: getTags(post.properties.Tags.multi_select),
  };
};

export const getSinglePost = async (slug) => {
  const response = await notion.databases.query({
      database_id: process.env.NOTION_DATEBASE_ID,
      filter: {
          property: "Slug",
          formula: {
              string:{
                  equals: slug,
              },
          },
      },
  });

  const page = response.results[0];
  const metadata = getPageMetaData(page);
  
  // https://www.npmjs.com/package/notion-to-md から引用
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(mdString);

  return{
      metadata,

      // これをslug.tsxで受け取る
      markdown: mdString,
  };
};

// Topページ用の記事の取得
export const getPostsForTopPage = async (pageSize = 4) => {
  // まずはgetAllPostsで全ての記事を取得してsliceして配列の先頭4つだけ取ってくるようにする
  const allPosts = await getAllPosts();
  // sliceで取ってきたデータを入れる箱を用意
  const fourPosts = allPosts.slice(0, pageSize);

  // 取得した値を返してindex.tsxに渡す
  return fourPosts;  
}

// ページ番号に応じた記事を取得する
export const getPostsByPage = async (page: number) => {
  // まずは全部のページを取得してくる
  const allPosts = await getAllPosts();
  
  // (page-1)* 1ページに取得したい記事数 今回は4としておく 
  // NUMBER_OF_POSTS_PER_PAGEはconstants.tsから持ってくる
  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE;
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;

  // これを[page].tsxで呼び出す
  return allPosts.slice(startIndex, endIndex)
}
// ブログの投稿した数によってページ数がどのように変わっていくのか
// そのページ数を取得する関数を作っていく
export const getNumberOfPages = async () => {
  const allPosts = await getAllPosts();

  // allPostsの配列の数がどれだけあるのか(投稿されているのか)を確認するために全て出力する
  // Math.floorで端数が出た時は四捨五入して切り捨てて表示させる
  // 余りが0以上であれば1を返す,余りが無ければ0を返して、[page].tsxで呼び出す
  return Math.floor(allPosts.length / NUMBER_OF_POSTS_PER_PAGE) +
     (allPosts.length % NUMBER_OF_POSTS_PER_PAGE > 
     0
     ? 1
     : 0)
}

// 引数で指定したtagNameとallPostsで取得した
// 一つ一つのデータのtagが一致するものだけを返す
export const getPostByTagAndPage =async (tagName:string, tagName1:string, page:number) => {
  const allPosts = await getAllPosts();

  // getAllPostsで取得したデータにフィルターをかけていく
  // postsの中に各々作って、指定したタグが入ってくる
  // それをfilter関数とfind関数で一致したデータだけを返す感じ
  const posts = allPosts.filter( (post) => 
    post.tags.find( (tag:string) => tag === tagName)
  )
  console.log(posts);

  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE;
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;

  // これを[page.tsx]のBlogTagPageListの方に呼び出す
  return posts.slice(startIndex, endIndex)
}

//タグに応じて出力するページ数が変化する関数を作る
export const getNumberOfPagesByTag =async (tagName:string) => {
  const allPosts = await getAllPosts();
  const posts = allPosts.filter( (post) => 
  post.tags.find( (tag:string) => tag === tagName )
  )

  // allPostsの配列の数がどれだけあるのか(投稿されているのか)を確認するために全て出力する
  // Math.floorで端数が出た時は四捨五入して切り捨てて表示させる
  // 余りが0以上であれば1を返す,余りが無ければ0を返して、[page].tsxで呼び出す
  return Math.floor(posts.length / NUMBER_OF_POSTS_PER_PAGE) +
     (posts.length % NUMBER_OF_POSTS_PER_PAGE > 
     0
     ? 1
     : 0)
}

export const getAllTags =async () => {
  const allPosts = await getAllPosts();

  const allTagsDuplicationLists = allPosts.flatMap((post) => post.tags);
  const set = new Set(allTagsDuplicationLists);
  const allTagsList = Array.from(set);

  return allTagsList;
}