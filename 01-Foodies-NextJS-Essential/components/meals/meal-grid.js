import classes from "./meal-grid.module.css";
import MealItem from "./meal-item";

export default function MealGrid({ meals }) {
  return (
    <ul className={classes.meals}>
      {meals.map((meal) => (
        <MealItem key={meal.id} {...meal} />
      ))}
    </ul>
  );
}
