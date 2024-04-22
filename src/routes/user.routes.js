/* 
NEXT WE MAKE ROUTES
Why creating Routes are important?
as we made methods, we wamt to define... when a perticular method will run? 
like, we show perticular data when we hit a perticular url on the website. 
That's why routing is necessary so that we handle all the methods swiftly and easily.
*/

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
// Importing as an object as we export it as an object


const router = Router() // defining router constant while giving all the routes functionality to the route constant 

// register route
router.route("/register").post(registerUser)


/* BREAKDOWN
router.route("/register") --> defined the route/ if this hit
.post(registerUser) --> What method it will run/ i will call this method
*/

export default router

// we import this to app.js file