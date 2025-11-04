import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";

import fs from "fs";

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error("Failed to fetch meals");
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const filename = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${filename}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (err) => {
    if (err) {
      throw new Error("Failed to save image");
    }
  });

  meal.image = `/images/${filename}`;

  db.prepare(
    `
    INSERT INTO meals (slug, title, image, summary, instructions, creator, creator_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    meal.slug,
    meal.title,
    meal.image,
    meal.summary,
    meal.instructions,
    meal.creator,
    meal.creator_email
  );
}
