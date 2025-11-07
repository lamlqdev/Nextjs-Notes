import Posts from "@/components/posts";
import { getPosts } from "@/lib/posts";

// export const metadata = {
//   title: "All posts by all users",
//   description: "Browse and share amazing posts.",
// };

export async function generateMetadata() {
  const posts = await getPosts();
  return {
    title: `${posts.length} posts by all users`,
    description: "Browse and share amazing posts.",
  };
}

export default async function FeedPage() {
  const posts = await getPosts();
  return (
    <>
      <h1>All posts by all users</h1>
      <Posts posts={posts} />
    </>
  );
}
