import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{
 
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return{accessToken,refreshToken}

  }catch (error) {
  console.error("🔥 TOKEN GENERATION ERROR:", error);
  throw new ApiError(500, error.message);
}

}

const registerUser = asyncHandler(async (req, res) => {

  const { fullname, email, username, password } = req.body;

  // validation
  if (![fullname, email, username, password].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  // check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // create user
  const user = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async(req,res) =>{
     //req body -> data
     //username or email
     //find the user
     //password cheak
     //access and refresh token
     //send cookie

     const {username , email ,password} = req.body;
    //  console.log("email")

     if(!(username || email)){
      throw new ApiError(400,"username or email is reqiured")
     }
      
    //  const user = await User.findOne({
    //   $or:[{username},{email}]
    //  })

    const query = [];

   if (username) query.push({ username });
   if (email) query.push({ email });

   const user = await User.findOne({ $or: query });


     if(!user){
      throw new ApiError(404,"User does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)

     if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials")
     }
     console.log("Logging in user:", user.email);
     console.log("Password valid?", isPasswordValid);

     const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);


     const loggedUser = await User.findById(user._id).
     select("-password -refreshToken")

     const options = {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
         new ApiResponse(
          200,
          {
            user:loggedUser,accessToken,refreshToken
          },
          "User logged In Successfully"
         )
     )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      }
    )
     const options = {
      httpOnly:true,
      secure:true
     }
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req,res) =>
{
  const incomingRefershToken = req.cookies.refreshToken || req.body.refreshToken

  if(incomingRefershToken){
    throw new ApiError(401,"unauthorized request")
  }

 try {
   const decodedToken = jwt.verify(
     incomingRefershToken,
     process.env.REFRESH_TOKEN_SECRET
   )
   const user = await user.findById(decodedToken?._id)
 
   if(!user){
     throw new ApiError(401,"Invalid refresh token")
   }
 
   if(incomingRefershToken !== user?.refreshToken){
     throw new ApiError(401,"Refresh Token is expired or used")
   }
 
   const options = {
     httpOnly:true,
     secure:true
   }
 
   const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
 
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken,refreshToken:newRefreshToken},
       "Access token refreshed"
     )
   )
 } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
 }

})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};







