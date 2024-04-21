import multer from "multer";

const storage = multer.diskStorage({ // we close to upload on disk
    destination: function (req, file, cb) { // here we made a function called destination
        /* 
        - here we get request(req) from the user,
        - file gives you access to all the files coming with the request along with the json data
        as we configure json data in request body already but file can't get in it thats why we use multer  to get such functionality
        - cb is our callback. like, if this function is called what this function will return
        */

        cb(
            null, // 1st Parameter: if error while recieving file in our temp folder. Here we kepp it null as we dont want to do much to handle it
            "./public/temp" // 2nd parameter: destination folder name, where you want to keep all the files, you recieved.
        )
    },
    filename: function (req, file, cb){ // what name you want to give to the file you uploaded
        cb(
            null, // 1st Parameter: if error while recieving file in our temp folder. Here we kepp it null as we dont want to do much to handle it
            file.originalname // 2nd Parameter: we keep the file name same as it was when being uploaded by the user
        )// As the file will stay for a tiny time, as we upload it from our local server to cloudinary and delete the file from our system
        // that's why keeping the same name as file name cause no harm
    }
})

export const upload = multer({
    storage,
})