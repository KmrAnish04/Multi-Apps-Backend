import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import util from 'util';


const connectDB = async () => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\nMONGODB  Connected Successfully !! \nDB HOST: ${connectionInstance.connection.host}`);
        // console.log(util.inspect(connectionInstance, {depth: null}))
    }
    catch (error) {
        console.log("MONGODB Connection Failed! \n", error);
        process.exit(1);
    }
}

export default connectDB;