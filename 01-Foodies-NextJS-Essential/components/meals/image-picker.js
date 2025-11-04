"use client";

import { useRef, useState } from "react";

import Image from "next/image";

import classes from "./image-picker.module.css";

export default function ImagePicker({ label, name }) {
  const [imagePicked, setImagePicked] = useState(null);
  const imageRef = useRef();

  function handleImagePick() {
    imageRef.current.click();
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePicked(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePicked(null);
      return;
    }
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>

      <div className={classes.controls}>
        <div className={classes.preview}>
          {imagePicked ? (
            <Image src={imagePicked} alt="Picked image preview" fill />
          ) : (
            <p>No image uploaded</p>
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          name={name}
          accept="image/*"
          ref={imageRef}
          onChange={handleImageChange}
          required
        />
        <button
          className={classes.button}
          type="button"
          onClick={handleImagePick}
        >
          Pick an image
        </button>
      </div>
    </div>
  );
}
