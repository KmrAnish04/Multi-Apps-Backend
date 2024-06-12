import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res)=>{
    
    const {fullName, email, userName, password} = req.body;

    if([fullName, email, userName, password].some(feild => feild?.trim() === "")){
        throw new ApiError(400, "All feilds are required!");
    }

    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    });

    if(existedUser){
        throw new ApiError(401, "UserName or email already existing !!!");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!!!");
    }

    const avatarCloudinary = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadFileOnCloudinary(coverImageLocalPath);

    if(!avatarCloudinary){
        // Not sure weather this will come under user side error or server side error
        // throw new ApiError(501, "Something Went Wrong While Uploading Avatar Image");
        throw new ApiError(400, "Avatar file is required!!!");
    }

    const user = await User.create({
        fullName,
        avatar: avatarCloudinary.url,
        coverImage: coverImageCloudinary?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(501, "Something Went Wrong While Registering The User!!!");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Registered Successfully!!!")
    );

    



});


export { registerUser };