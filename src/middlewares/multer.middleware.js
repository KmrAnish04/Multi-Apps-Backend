import multer from "multer";



////////////////////////////////////////////////////////////////////////////
//                      Mutler File Upload Middleware
////////////////////////////////////////////////////////////////////////////
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
})





// ***************************** Methods Exports ***************************** 
export const upload = multer({storage});