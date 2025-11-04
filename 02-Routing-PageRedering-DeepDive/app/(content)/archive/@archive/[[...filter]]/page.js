import Link from "next/link";

import {
  getAvailableNewsMonths,
  getAvailableNewsYears,
  getNewsForYear,
  getNewsForYearAndMonth,
} from "@/lib/news";

import NewsList from "@/components/news-list";

export default function ArchiveYearPage({ params }) {
  const { filter } = params;

  const selectedYear = filter?.[0];
  const selectedMonth = filter?.[1];

  let news;
  let links = getAvailableNewsYears();

  let newsContent = <p>No news selected in this archive.</p>;

  if (selectedYear && !selectedMonth) {
    news = getNewsForYear(selectedYear);
    links = getAvailableNewsMonths(selectedYear);
  }

  if (selectedYear && selectedMonth) {
    news = getNewsForYearAndMonth(selectedYear, selectedMonth);
    links = [];
  }

  if (news && news.length > 0) {
    newsContent = <NewsList news={news} />;
  }

  if (
    (selectedYear && !getAvailableNewsYears().includes(+selectedYear)) ||
    (selectedMonth &&
      !getAvailableNewsMonths(selectedYear).includes(+selectedMonth))
  ) {
    throw new Error("Invalid year or month");
  }

  return (
    <>
      <header id="archive-header">
        <nav>
          <ul>
            {links.map((year) => {
              const href = selectedYear
                ? `/archive/${selectedYear}/${year}`
                : `/archive/${year}`;
              return (
                <li key={year}>
                  <Link href={href}>{year}</Link>{" "}
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      {newsContent}
    </>
  );
}
