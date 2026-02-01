import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Define an endpoint for document uploads
  docUploader: f({ 
    pdf: { maxFileSize: "4MB" }, 
    image: { maxFileSize: "4MB" } 
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for url:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;