const asyncHandler = (fn) => {
    return async(req, res, next) => {
        try{
            await fn(req, res, next);
        }
        catch (error){
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            })
        }
    }
};


// // or
// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//         .catch( (error) => next(error) );
//     }
// }


export { asyncHandler };