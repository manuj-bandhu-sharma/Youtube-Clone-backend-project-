import { asyncHandler } from "../utils(utilities)/asyncHandler.js"; // for handling web requests
import { APIError } from "../utils(utilities)/APIError.js"; // used for validation
import { User } from "../models/user.model.js"; // used to add, delete and check if user exists or not
import { uploadOnCloudinary } from "../utils(utilities)/couldinary.js"; // used to upload files on clodinary server
import { APIResponse } from "../utils(utilities)/APIResponse.js"; // used to return structured and crafted response
import { response } from "express";

// ----------------------------------------------------------------------------------------------/
                    // METHODS -> FUNCTIONS that can called MULTIPLE TIMES //
// ----------------------------------------------------------------------------------------------/
    const generateAccessAndRefreshTokens = async(userId) => {
        
        try {
            const user = await User.findById(userId) //If we found the user's properties
            const accessToken = await user.generateAccessToken() // This is a methods thats why we add "()" after funtion name
            const refreshToken = await user.generateRefreshToken() // This is a methods as well
 
            user.refreshToken = refreshToken // storing the generated token in database for the perticular found user
            
            // Once generated token is updated for the user in db, then we save it in the mongo databse
            await user.save( {validateBeforeSave : false} )
            /* 
                Remember,
                    as we try to save, required fields in Mongoose model will kick-in (by default).
                    like, password is a required field, and in initially we don't have the password.
                    but, because we updating only a single field here (refresh token).
                    That's why we pass a parameter "validationBeforeSave" => false. 
                    Which means, don't put any validation, just go straight and save it.
            */


            /*
            Now, as we generated access key and refresh token and saved refresh token in database.
            we return both the values.

            Why we saved only refresh token and not access token in database?
            because access tokens are valid for shorter period of time, and only used while user is trying to access our server initially.
            but, refresh token is required as its valid for long period of time, and if we have it store. 
            we dont have to ask user to re-login as we can validate user with the refresh token in his cokies matching it with token present in the database for the user
            if refresh token (local cookies) === refresh token (in database) the user will be able to use the webapp without re-login
            if the refresh token is expired or didn't matched, user will be asked for re-login

            */
           return {accessToken, refreshToken}
           
           //user.accessToken = accessToken // storing the generated token in database for the perticular found user

        } catch (error) {
            // console.log(error)
            throw new APIError(500, "Something went wrong while generating access and refresh tokens!")        
        }
    }


// ----------------------------------------------------------------------------------------------/
                           // REGISTER USER //
// ----------------------------------------------------------------------------------------------/

/* 
The Algorithm we follow to register a user
    1) get user details from frontend
    2) validation - if any required field is empty or not
    3) check if user already exists: check through username or email
    4) check for images: check for avatar(required field)
    5) upload them to cloudinary- check avatar exist for the user or not
    6) create user object - create entry in DB
    7) remove password and refresh token field from response
    8) check for user creation 
    9) return response: null(failed) , response(successful) 
*/

const registerUser = asyncHandler(async (req, res) => {
    // 1) get user details from frontend
    const { fullName, email, username, password } = req.body
    /*  
    - req.body holds all the details required from front-end
    we can get data from req.body, if the data coming through a form or json body
    - we can extract data from the body by destructuring,--> const{} (object)
    while destructuring, we can define fields which we want from user
    like, username, fullName, email, username, password [in our case]
    */
   console.log("Details that a request body holds: \n" , req.body);
   /*
   Details that a request body holds: (req.body) <-- Details we get from the frontend
    [Object: null prototype] {
        fullName: 'Manuj Bandhu Sharma',
        email: 'manujbandhusharma@gmail.com',
        password: 'Manuj@7737',
        username: 'Manuj.24'
    }
   */
   console.log("-----------------------------------------------------------");
    console.log("Full Name: ", fullName);
    console.log("Email: ", email);
    console.log("User Name: ", username);
    console.log("Password: ", password);
    console.log("-----------------------------------------------------------");
    
    // 2) Validation
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        /*
        Checking if any of the value/field exist or not by using (?). 
        if it exists and even after trimming(.trim()) it's still empty ("") 
        then send true otherwise false as response of IF condition
        */
    ) {// if the above condition is true, execute the below code.
        throw new APIError(
            400, // status code
            "All Fields are required" // message
        )
    }
    // 3) check if user already exists
    const existedUser = await User.findOne({
        // Here, findOne returns whatever value it finds first, from the database for the defined fields
        // and in last, we holding the reference into a variable (const existedUser) 
        $or: [{ username }, { email }] // it is the query
        /* Here, 
            $or - it is an operator property (key)
            [ { username },{ email } ] - array of objects (value)
            - It will return the fisrt value/document found in the db, matching to the user input
        */
    })
    console.log("Checking if User Existed? : ", existedUser);
    console.log("-----------------------------------------------------------");

    // Checking if user exists or not
    if (existedUser) { // if existedUser is true
        throw new APIError(409, "User with email or username already exists")
    }

    // 4) Getting the file path and checking for image's existance

/*
    console.log("Checking Response object : \n", req);
    console.log("-----------------------------------------------------------");
    console.log("Response object's details of uploaded images :\n", req.files);
    console.log("-----------------------------------------------------------");
    console.log("Checking if Path field exists in Response object? : ", req.files?.path);
    console.log("-----------------------------------------------------------");

*/
    const avatarLocalPath = req.files?.avatar[0]?.path

    
    /*
        Response object's details of uploaded images : (req.files) 
    [Object: null prototype] {
        avatar: [
            {
                fieldname: 'avatar',
                originalname: 'claudio-schwarz-k39RGHmLoV8-unsplash.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: './public/temp',
                filename: 'claudio-schwarz-k39RGHmLoV8-unsplash.jpg',
                path: 'public\\temp\\claudio-schwarz-k39RGHmLoV8-unsplash.jpg',
                size: 9145407
            }
        ],
            coverImage: [
                {
                    fieldname: 'coverImage',
                    originalname: 'ashish-kumar-UrNslyuxH6k-unsplash.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    destination: './public/temp',
                    filename: 'ashish-kumar-UrNslyuxH6k-unsplash.jpg',
                    path: 'public\\temp\\ashish-kumar-UrNslyuxH6k-unsplash.jpg',
                    size: 73202
                }
            ]
    }
     */

    //console.log("Avatar file's local path : ", avatarLocalPath);

    /* Here,
    as we get all the data in (req.body), but because we added a middleware in routes(multer),
    gives us additional functionality. i.e., multer gives an additional property (req.files) --> this is how we access the files
    so, if the file exists, we check it by using (?) optional chaining
    for the defined field "avatar". 
    we require its 1st property "[0]" cause it gives us an object which we again check by (?) optional chaining
    if we get that object, we can write a path (.path) provided by the multer
    
    In the end, we storing it in a variable named as "avatarLocalPath"
    cause till now this file is on our server, not yet gone to the cloudinary yet!!.
    */

    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    //console.log("Cover Image Local Path: ", coverImageLocalPath);
    // console.log("Cover Image Existance : ", req.files?.coverImage);
    // console.log("-----------------------------------------------------------");

    // console.log("required file : ", req.files);
    // console.log("-----------------------------------------------------------");

    // console.log("Cover Image array : ", Array.isArray(req.files.coverImage));
    // console.log("-----------------------------------------------------------");
    
    // console.log("Cover Image array's length : ", req.files.coverImage.length);
    // console.log("-----------------------------------------------------------");


    let coverImageLocalPath; // initializing a variable which we going to use locally and it can be changed
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // 4.2) As Avatar is a mendatory field, we going to check its existance
    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar Image is required")
    }

    // 5.1) upload them to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    /*
    NOTE: this step gonna take time surely as we uploading an Image File, 
    thats why we use "await" keyword. why?
    Because we want the preceeding code to wait (intensionally) until this step is complete.
    that is the reason we used "async" keyword in the initiation of the function
    
    once its uploaded,
    then give me a reference and i will store it in a variable (avatar)
    */

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // 5.2) Checking if avatar exists or not?
    if (!avatar) { throw new APIError(400, "Avatar Image is required") }

    // 6.1) create user object - create entry in DB
    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(), // as we want to keep the username to be in lowercase always
        avatar: avatar.url, // We already validate it above and here we don't want to save everything about the image in database but only its url.
        coverImage: coverImage?.url || "", // This is optional
        /*
        NOTE: Corner case, Safety Measure
        Here, the cover image is not compulsory we have to apply a check to validate its existance.
        if the url exists then send it, otherwise send a empty string ("")
        */
    })


    /*
    Here, once this user is successfully created, MongoDB doesn't only store the provided data
    It also add (_id) field to each of the entry by default.
    */
    // 7) Validating created entry while removing password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    /* 
    so as we have a field named as "_id". 
    We can use it to validate by searching the entity's id in database. 
    if a user created or not
    After that, we will remove the password and refreshToken fields from the response before saving it to a variable
    And, we want to wait until this validation process is completed.
    */

    // 8) Check for User creation 
    if (!createdUser) {
        throw new APIError(500, "Something went wrong while registering a user")
    }

    // 9) return response
    return res.status(201).json(
        new APIResponse(200, createdUser, "User registed Successfully!!!")
    )
    /*
    Here, we are returning a response after creating a user. 
    Where, we provided its status as 201 --> .status(201) it will be read by postman while showing us the response
    and then, we send the data in json response.
    but, we want to send the response by our defined architecture... (to send it in a organized way)
    we will use an the APIResponse class,
        So, we created a new object of APIResponse class, where we have to provide
         1) status code
         2) data 
         3) message
    */
})



/* If checking for single field
   if (fullName === "") { // If fullName field is empty, then?
        throw new APIError(
            400, // status code
            "fullName is required" // message
        )
   }
})
*/



/* Testing purpose while initializing 
const registerUser = asyncHandler(async (req, res) => {
    // Here async method is being used as parameter -in place of-> requestHandler
    res.status(200).json({ message: "ok" })
})
*/


// ----------------------------------------------------------------------------------------------/
                           // LOG IN USER //
// ----------------------------------------------------------------------------------------------/
    
/* 
The Algorithm we follow to login a user :
    1) get data from request body
    2) give uername or email based access
    3) find the user
    4) (if user exists) check the password
    5) (if password is varified) Generate access and refresh token
    6) send these token in cookies (secure cookies)
    7) response of login success
*/

    const loginUser = asyncHandler(async (req, res) => {
        // console.log(req.body)
// 1) get data from request body
        const {email, username, password} = req.body
        // console.log(`Email: ${email} and Username: ${username} and Password: ${password}`)

// 2) give uername or email based access
        // checking - Atleast username or email should exists:
        if (!username && !email) {
            throw new APIError(400, "Atleast one (username or email) is required")
        }

        // alternative :-
        // if (!(username || email)) {
        //     throw new APIError(400, "Atleast one (username or email) is required")
        // }


// 3) If Exist - find the user:
        // a) if we get [any one or both] of the required - Check in database
        const user = await User.findOne({ // Find User
            $or : [{username} , {email}] //--> MongoDB Operator
        })

        // b) if user doesn't exist / didn't find in database
        if (!user) {
            throw new APIError(404, "User does not exist!")
        }

// 4) if user exists ---> check the password
        // a) if user exists in database - ckeck password
        const isPasswordValid = await user.isPasswordCorrect(password) // Returns true or false

        // b) if password is invalid
        if (!isPasswordValid) { // if the value is false => notFalse(!False) = True, True === True
            throw new APIError(401, "Invalid User Credentials!")
        }

// 5) if password is varified ---> Generate access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) // to access the required user by its unique id.
        // console.log(accessToken, refreshToken)
        // const { accessToken, refreshToken } is called destructure

// 6) send these token in cookies (secure cookies)
        // what information to send to the user. (picking out unwanted fields like, password and refeshToken)
        const loggedInUser = await User.findById(User._id).select("-password -refreshToken")

        // sending cookies
        const options = { // by tagging them true, cookies can only be modified from server and not through frontend 
            httpOnly : true,
            secure : true
        } // sending secure cookies
        console.log("User logged In Successfully")
        // can send cookies as we used cookie-parser
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(
                200,
                { /*
                As we already set tokens in cookies. 
                then why sending tokens again in data body?
                Because, here we trying to handle the situation where maybe the user 
                wants to save his tokens in local storage for safety reason, or trying to access through mobile app (there we are not able to set cookies)
                */
                    User : loggedInUser, accessToken, refreshToken // sending tokens are optional
                },
                "User logged In Successfully"
            )
        )
        
    })


// ----------------------------------------------------------------------------------------------/
                           // LOG OUT USER //
// ----------------------------------------------------------------------------------------------/
const loggedOutUser = asyncHandler(async(req, res) => {
/*  
    The Algorithm we follow to login a user :
    1) remove user credentials
    2) remove/reset refresh token

    3) find the user
    4) (if user exists) check the password
    5) (if password is varified) Generate access and refresh token
    6) send these token in cookies (secure cookies)
    7) response of login success
*/
    // Didn't store it as we don't need to refer it later
    await User.findByIdAndUpdate(
        // for the specific found user
        req.USER._id,
        { // Clearing the refresh token
            $set: {
                refreshToken: undefined
            }
        },
        { // show response, once cleared
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    console.log("User logged Out Successfully")

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new APIResponse(200, {}, "User Logged Out Successfully !!!")
    )


})










// ----------------------------------------------------------------------------------------------/
                           // EXPORTING THE Functions //
// ----------------------------------------------------------------------------------------------/
export{
    registerUser,
    loginUser, 
    loggedOutUser
} // exporting as an object

// we import this to app.js file