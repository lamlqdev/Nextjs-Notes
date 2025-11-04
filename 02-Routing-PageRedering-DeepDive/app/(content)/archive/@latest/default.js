import { getLatestNews } from "@/lib/news";
import NewsList from "@/components/news-list";

export default function LatestNewsArchivePage() {
  const latestNews = getLatestNews();

  return (
    <>
      <h2>Latest News Archive Page</h2>
      <NewsList news={latestNews} />
    </>
  );
}
