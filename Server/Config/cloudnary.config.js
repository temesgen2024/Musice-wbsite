import cloudinary from 'cloudinary';



export const uploadsinglesong = async (filePath)=>{
    try {
        const res = await cloudinary.uploader.upload(filePath, {
            resource_type: "video",
            folder: "singlesongs"
        });
        return res;
    } catch (error) {
        console.log(error);
    }
}
