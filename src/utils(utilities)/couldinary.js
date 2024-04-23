import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; // fs stands for file structure, it comes with its various methods 
// it comes preinstalled with Node js

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {// if file path is not defined
        if(!localFilePath) return "Could not find file path";
        // else upload the file on cloudinary
        const response  = await cloudinary.uploader.upload( // as upload going to take a while to finish
            localFilePath, {
                resource_type: "auto"
            })
        // if successfully uploaded we print the statement with its url
       // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file, if file uploaded successfully to cloudinary
        return response // at last we return the response to the user
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload opration got failed 
        return "File upload fail to cloudinary";
    }
}

export {uploadOnCloudinary}