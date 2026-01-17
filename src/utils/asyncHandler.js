// const asyncHandler = (requestHandler) => {
//     return (req,res,next) =>{
//         Promise.resolve().catch((err) => next(err)).
//         catch((err) => next(err))
//     }
// }

// export {asyncHandler}

const asyncHandler = (requestHandler) => {
 return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
  
};
export { asyncHandler };

// try catch syntax
// const asyncHandler =(fun)=>async(req,res,next)=>{
//   try {
//     await fun(req,res,next)
//   } catch (error) {
//   res.status(err.code ||500).json({
//     success: false,
//     message: err.message || "Internal server error"
//   })
// }
// }

// const asyncHandler = () => {}
// const asyncHandler =(func) => () => {}
// const asyncHandler = (fn) => () =>{}

// const asyncHandler = (fn) => async(req,res,next) =>{
//     try{
//          await fn(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             sucess:false,
//             message:error.message
//         })
//     }
// }
    
