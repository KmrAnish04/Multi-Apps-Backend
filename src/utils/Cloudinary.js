import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_APIKEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});


const uploadFileOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const fileUploadResponse = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        console.log(`File Uploaded On Cloudinary Successfully!!!✅ \n File Link: ${fileUploadResponse.url}`);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation is succeed. 
        return fileUploadResponse;
    } 
    catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation got failed. 
        console.log(`Error Occured While Uploading File On Cloud!!!❌ \n ERROR: ${error}`);
        console.log(`Removing File from local storage!!!⚠️`);
        return null;
    }
}


export { uploadFileOnCloudinary };