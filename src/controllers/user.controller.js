import { asyncHandler } from "../utils(utilities)/asyncHandler.js";
import { APIError } from "../utils(utilities)/APIError.js"; // used for validation
import { user } from "../models/user.model.js"; // used to add, delete and check if user exists or not
import { uploadOnCloudinary } from "../utils(utilities)/couldinary.js"; // used to upload files on clodinary server
import { APIResponse } from "../utils(utilities)/APIResponse.js"; // used to return structured and crafted response

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
    console.log("Full Name: ", fullName);
    console.log("Email: ", email);
    console.log("User Name: ", username);
    console.log("Password: ", password);

    // 2) Validation
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        // Checking if any of the value/field exist or not by using (?). 
        // if it exists and even after trimming(.trim()) it's still empty ("") 
        // then send true otherwise false as response of IF condition
    ) {// if the above condition is true, execute the below code.
        throw new APIError(
            400, // status code
            "All Fields are required" // message
        )
    }
    // 3) check if user already exists
    const existedUser = user.findOne({
        // Here, findOne returns whatever value it finds first, from the database for the defined fields
        // and in last, we holding the reference into a variable (const existedUser) 
        $or: [{ username }, { email }] // it is the query
        /* Here, 
            $or - it is an operator property (key)
            [ { username },{ email } ] - array of objects (value)
            - It will return the fisrt value/document found in the db, matching to the user input
        */
    })
    console.log("Existed User: ", existedUser);
    if (existedUser) { // existedUser is true
        throw new APIError(409, "User with email or username already exists")
    }

    // 4) Getting the file path and checking for image's existance
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log("Avatar file's local path : ", avatarLocalPath);
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

    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log("Cover Image Local Path: ", coverImageLocalPath);

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
    const User = await user.create({
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
    const createdUser = await user.findById(User._id).select(
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



/* The Algorithm we follow to register a user
    1) get user details from frontend
    2) validation - if any required field is empty or not
    3) check if user already exists: check through username or email
    4) check for images: check for avatar(required field)
    5) upload them to cloudinary- check avatar exist for the user or not
    6) create user object - create entry in DB
    7) remove password and refresh token field from response
    8) check for user creation 
    9) return response: null(failed) , response(successful)

// (User-[send_data_to]->our_local_server-[send_image_to]->cloudinary-[send_image_back_to]->our_local_server)
*/

/* Testing purpose while initializing 
const registerUser = asyncHandler(async (req, res) => {
    // Here async method is being used as parameter -in place of-> requestHandler
    res.status(200).json({ message: "ok" })
})
*/

export{registerUser} // exporting as an object

// we import this to app.js file