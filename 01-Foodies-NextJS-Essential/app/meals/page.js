import Link from "next/link";
import { Suspense } from "react";

import classes from "./page.module.css";
import MealGrid from "@/components/meals/meal-grid";

import { getMeals } from "@/lib/meal";

export const metadata = {
  title: "Meals",
  description: "Delicious meals created by you",
};

async function Meals() {
  const meals = await getMeals();
  return <MealGrid meals={meals} />;
}

export default function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meal, created{" "}
          <span className={classes.highlight}>by you</span>
        </h1>
        <p>
          Choose your favourite recipe and cook it yourself. It is easy and fun!
        </p>
        <p className={classes.cta}>
          <Link href="/meals/shares">Share your favorite meal</Link>
        </p>
      </header>
      <main className={classes.main}>
        <Suspense
          fallback={<p className={classes.loading}>Fetching Meals...</p>}
        >
          <Meals />
        </Suspense>
      </main>
    </>
  );
}
