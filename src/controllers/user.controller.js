import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";



////////////////////////////////////////////////////////////////////////////
//                          User Register Handler
////////////////////////////////////////////////////////////////////////////
const registerUser = asyncHandler( async (req, res)=>{
    
    const {fullName, email, userName, password} = req.body;
    if([fullName, email, userName, password].some(feild => feild?.trim() === "")){
        throw new ApiError(400, "All feilds are required!");
    }
    

    const existedUser = await User.findOne({ $or: [{ userName }, { email }]});
    if(existedUser){ throw new ApiError(401, "UserName or email already existing !!!"); }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){ throw new ApiError(400, "Avatar file is required!!!"); }

    const avatarCloudinary = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadFileOnCloudinary(coverImageLocalPath);

    if(!avatarCloudinary){
        // Not sure weather this will come under user side error or server side error
        // throw new ApiError(501, "Something Went Wrong While Uploading Avatar Image");
        throw new ApiError(400, "Avatar file is required!!!");
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        avatar: avatarCloudinary.url,
        coverImage: coverImageCloudinary?.url || "",
        email,
        password
    });


    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){ throw new ApiError(501, "Something Went Wrong While Registering The User!!!"); }

    return res.status(201).json( new ApiResponse(201, createdUser, "User Registered Successfully!!!") );
});


////////////////////////////////////////////////////////////////////////////
//                          User Login Handler
////////////////////////////////////////////////////////////////////////////
const loginUser = asyncHandler( async(req, res) => {

    // **** Here needs to be check, that in loginUser route why we are not able to send data 
    // using form-data type section in postman, why only using raw-json type section  we are
    // able to send data, while in registerUser form-data type section is also working due to
    // which only we are able to send files also. ****
    const {userName, email, password} = req.body;
    console.log(userName, email)


    if(!userName && !email){ throw new ApiError(402, "username or email is required!"); }

    const user = await User.findOne({ $or: [{userName}, {email}] });
    if(!user){ throw new ApiError(404, "User doesn't exist!!!"); }
    
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){ throw new ApiError(400, "Invalid user credentials!!!"); }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user);
    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            { 
                user: loggedInUser, 
                accessToken, 
                refreshToken
            },
            "User LoggedIn Successfully!!!✅"
        )
    )


});


////////////////////////////////////////////////////////////////////////////
//                          User Logout Handler
////////////////////////////////////////////////////////////////////////////
const logoutUser = asyncHandler( async (req, res)=>{
    const userId = req.user?._id;
    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: undefined } },
        { new: true } // It will given you the new updated user in which refreshToken will be undefined
    );

    const options = { httpOnly: true, secure: true };

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User Logged Out Successfully!!!") );
});


////////////////////////////////////////////////////////////////////////////
//                          Reassign/Refresh Access Token
////////////////////////////////////////////////////////////////////////////
const refreshAccessToken = asyncHandler(async (req, res) => {
    const userRereshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!userRereshToken){ throw new ApiError(401, "Unauthorized Request!!!")}
    
    const decodedToken = Jwt.verify(userRereshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decodedToken._id;
    const user = await User.findById(userId);

    if(!user){ throw new ApiError(401, "Invalid Refresh Token!!!")}
    if(userRereshToken !== user?.refreshToken){ throw new ApiError(401, "Refresh Token is expired or user!!!")}

    const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user);

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(
        200, 
        { newAccessToken, newRefreshToken },
        "Access Token Refreshed Successfully!!!✅"
    ));


});

// Some Utilities functions

///////////////////////////////////////////
//          Generate Tokens
///////////////////////////////////////////
async function generateAccessAndRefreshTokens(user){
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false}); //validateBeforeSave is set to false, to avoid validating all other feilds and just update refreshToken
    return {accessToken, refreshToken};
}





// ***************************** Methods Exports ***************************** 
export { registerUser, loginUser, logoutUser };