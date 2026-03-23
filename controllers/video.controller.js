import { Video } from "../models/video.model.js"


export const addVideos = async (request,response)=>{
    const {title,youtubeUrl,latest,description,thumbnailUrl,category} = request.body
    try {
        if(!title || !youtubeUrl || !latest || !description || !thumbnailUrl || !category){
            return response.status(409).json({message:"All fields are required"})
        }

        const newVideo = await Video({
            title,
            youtubeUrl,
            latest,
            category,
            description,
            thumbnailUrl
        })

        await newVideo.save()
        return response.status(201).json({message:"Video added successfully"})
    } catch (error) {
        return response.status(500).json({message:"something went wrong",error:error.message})
    }
}

export const getAllVideos = async (request,response)=>{
    const {search,title,latest,category,page=1,limit=6} = request.query
    try {
        const queryObject = {}
        if(latest){
            queryObject.latest = {$regex:latest,$options:'i'}
        }
        if(title){
            queryObject.title = {$regex:title,$options:'i'}
        }
        if(category){
            queryObject.category = {$regex:category,$options:'i'}
        }
        if(search){
            queryObject.$or = [
                {title:{ $regex:search , $options:'i' }},
                 {description: {$regex: search, $options:'i'}},
                {category: {$regex: search, $options:'i'}}
            ]
        }
        
        const skip = (parseInt(page)-1)*parseInt(limit)

        const videos = await Video.find(queryObject)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({createdAt:-1})

        if(videos.length === 0 ){
            return response.status(404).json({message:"no videos found"})
        }

        const totalVideos = await Video.countDocuments(queryObject)
        const totalPage = Math.ceil(totalVideos/parseInt(limit))

        return response.status(200).json({
            success:true,
            totalPage,
            videos
        })
    } catch (error) {
        return response.status(500).json({message:"something went wrong",error:error.message})
    }
    
}

export const updateVideos = async (request,response)=> {
    const id = request.params.id
    try {
        const video = await Video.findByIdAndUpdate(id,{$set:request.body},{new:true})
        if(!video){
            return response.status(404).json({message:"video cannot be found to be updated"})
        }

        return response.status(200).json({
            success:true,
            video
        })
    } catch (error) {
        return response.status(500).json({message:"something went wrong",error:error.message})
    }
}
