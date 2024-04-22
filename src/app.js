import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

// Assigning MIDDLE-WARES
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // limit the json size
// so that it doesn't crashes when our server gets a heavy json files.

app.use(express.urlencoded({extended:true, limit:"16kb"})) // to access the data coming from url

app.use(express.static("public")) // its a folder to store the data, if required
/* 
    if i want to store some files, images or videos on my server(temporarily) 
    so, i will gonna keep them in a folder name "public" 
    like a folder which is accessible publically
*/


//To use CURD operation on cookie's through client's browser
app.use(cookieParser()) 


// Import routes
import userRouter from './routes/user.routes.js' 
// we can import by custom name only, when we exporting it with a default tag

// Routes Declaration
app.use("/api/v1/users", userRouter)

/* 
app.use( // ".use" keyword as we using a middleware here
    "/users", // on what extention of API or prefix of URL
    userRouter // where to redirect/ pass on? OR send request to which file? 
) 

For Example it will go on the route 
http://localhost:8000/api/v1/users --> /register or /login based on our preference/requirement
*/

// Exporting app
export {app}
