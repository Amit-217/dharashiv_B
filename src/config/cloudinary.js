import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true, // CLOUDINARY_URL वापरतो
});

export default cloudinary;
