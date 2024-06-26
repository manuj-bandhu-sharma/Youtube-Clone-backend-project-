/* 
NEXT WE MAKE ROUTES
Why creating Routes are important?
as we made methods, we wamt to define... when a perticular method will run? 
like, we show perticular data when we hit a perticular url on the website. 
That's why routing is necessary so that we handle all the methods swiftly and easily.
*/

import { Router } from "express";
import { loggedOutUser, loginUser, registerUser } from "../controllers/user.controller.js"; // Importing as an object as we export it as an object

// To handle files 
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";
// this handles the files rather then text, coming from the user
// as its a middleware so it will execute in the middle of process


const router = Router() // defining router constant while giving all the routes functionality to the route constant 

// register route
router.route("/register").post( // if someone requesting to register route
    // using our middleware from multer
    upload.fields( // its a function
        [ // which accept array of
        { // object1
            name: "avatar",
            maxCount: 1
        },
        { // object2
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser // then the ending process
)
/* BREAKDOWN
router.route("/register") --> defined the route/ if this hit
.post(registerUser) --> What method it will run/ i will call this method
*/

router.route("/login").post(loginUser)


// Secured routes
router.route("/logout").post(verifyJWT, loggedOutUser) // Middleware used here just before loggedout function, just add the middlewares as many as you want by seprating them by comma 

export default router
// we import this to app.js file