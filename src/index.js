// require('dotenv').config({path: './env'});
// or

import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";
dotenv.config({path: './env'});




connectDB()
.then(()=>{

    // Not sure weather app has on event or not
    // app.on("error", (error) => {
    //     console.log("ERROR: ", error);
    //     throw error;
    // })

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`⚙️  Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongo DB connection Failed !!!", error);
})










/* 
import express from "express";
const app = express();

;( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${{DB_NAME}}`);
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(error) {
        console.log("ERROR: ", error);
        throw error;
    }
})()
*/
