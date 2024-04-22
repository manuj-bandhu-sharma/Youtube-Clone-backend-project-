
import dotenv from "dotenv"
import connectDB from "./db/index.js";

import {app} from './app.js'

/*
1st Way - as defined on dotenv website
required('dotenv').config({path:'./env'}) // proper syntex
this will run but it breaks the consistancy
as it uses the basic mode of javascript.
*/

// 2nd Way - to keep our code consistant
dotenv.config({path:'./env'})
    /*
this takes care that as soon as the app is loaded,all the environment variables 
should become avaiable everywhere.
So that if all the variables once available in main file, after that no matter what 
variable you used where, everyone get the access to it.
That's why we try to give access of all variables from first executed file(main file)
so that, if its loaded, we try to load our environment variables there.
    */

app.on("error", (error) => {
    console.log('Not Able to connect the app. \n Error: ', error);
    throw {error}
})

connectDB()
    .then(() => {
        app.listen( // to start listening to the app while using the database
            process.env.PORT /* to listen from the defined port*/ || 8000 /* if defined port 
        not available then use (default) port: 8000 instead.
Best Practice - This helps with, not to let the app crash on production server*/
        , () => {
            console.log(`Server is running at: ${process.env.PORT}`);
        })
    })

    .catch((error) => { // if database throws error before connecting to the application
        console.log("MONGO db connection failed !!!", error);
    })


//----------------------------------------------------------------------------//


// 1st Approach to connect to the database
//import mongoose from "mongoose";
//import { DB_NAME } from "./constants";


// import express from "express"; // initialized app
// const app = express()

//     /*
// 1st Way - direct connect to the database
// function connectDB(){} // put credentials in the function - Define fn.
// connectDB() // connect to the database - Execute
//     */

//     /*
// 2nd Way - ifi with try-catch (execute imidiately)
// (here ; is a good practice to handle errors or to clean the other execution before running this one)
//  NOTE:- Database is in different continent, means it will take time to connect to the database
// so, its better to use async function instead of sync function.
//     */

// ;(async() => {
    //     try {
        //         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
        //         //connection + database name to connect to the correct database
        
        //         app.on("error", () => {
            //             console.log("ERROR: ", error);
            //             throw error
            //         })
            //         app.listen(process.env.PORT, () => {
                //             console.log(`App is listening on port ${process.env.PORT}`);
                //         })
                //     } catch (error) {
                    //         console.error("ERROR: ", error);
                    //         throw error
                    //     }
                    // }) ()

// 2nd Approach is in (.\src\db\index.js)