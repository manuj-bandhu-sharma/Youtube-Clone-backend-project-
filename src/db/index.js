import mongoose from "mongoose"; // database connector
import { DB_NAME } from "../constants.js"; // importing database

const connectDB = async () => {
    try {
        const connectionInstance= await mongoose.connect
        ( // Here, ${} means variable injection
            `${process.env.MONGODB_URI}/${DB_NAME}`
          // It returns an Object after execution
        )
        console.log
        ( // Get to know, on which host/server i am getting connected, 
          // as in production we can have different servers for different processes like,
          //  production, development, testing, they all have differnt end point hosts...
          // so just to clarify, we run the further command 
          // to varify that, if we are getting connected to the right database/host or not
            `\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection error", error); // 
        process.exit(1) // node.js gives a functionality
        // its the reference of the process running in backgroud 
        // and it have a lot of functionality, like exit
        // exit(1) - exit with a faliure in node process
    }
}

export default connectDB