import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";




////////////////////////////////////////////////////////////////////////////
//                      Jwt Token Verificator Middleware
////////////////////////////////////////////////////////////////////////////
const verifyJwt = asyncHandler(async (req, res, next)=>{
    // ****** Here below not able to get res.header("Authorization"), need to check why ? ******
    // const accessToken = req.cookie?.accessToken || res.header("Authorization")?.replace("Bearer ", ""); 
    
    const accessToken = req.cookies?.accessToken; 
    if(!accessToken){ throw new ApiError(404, "Unauthorized Request!!!");}
    const decodedToken = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // If token is invalid then it will throw error
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if(!user){ new ApiError(404, "Invalid AccessToken!!!");}
    req.user = user;
    next();
});



// ***************************** Methods Exports ***************************** 
export { verifyJwt }