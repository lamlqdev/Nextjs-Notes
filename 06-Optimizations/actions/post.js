"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { storePost, updatePostLikeStatus } from "@/lib/posts";
import { uploadImage } from "@/lib/cloudinary";

export async function createPost(prevState, formData) {
  const title = formData.get("title");
  const image = formData.get("image");
  const content = formData.get("content");

  let errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!content || content.trim().length === 0) {
    errors.push("Content is required");
  }
  if (!image || image.size === 0) {
    errors.push("Image is required");
  }

  if (errors.length > 0) {
    return { errors: errors };
  }

  let imageUrl = "";
  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    throw new Error("Failed to upload image");
  }

  await storePost({
    imageUrl: imageUrl,
    title: title,
    content: content,
    userId: 1,
  });

  revalidatePath("/feed");
  redirect("/feed");
}

export async function likePost(postId) {
  await updatePostLikeStatus(postId, 2);
  revalidatePath("/feed");
}
