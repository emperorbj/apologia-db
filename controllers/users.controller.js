
import { generateToken } from "../lib/getToken.js";
import { User } from "../models/users.model.js";
import bcrypt from "bcryptjs";


export const signup = async (request,response)=> {
    const {username,email,password} = request.body;
    try{
        if(!username || !email || !password ) {
            return response.status(401).json({message:'All fields are required'})
        }

        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        })

        if(userExists){
            return response.status(409).json({message:"User already exists"})
        }


        const hashedPassword = await bcrypt.hash(password,10)

        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

        const user = new User({
            username,
            email,
            password:hashedPassword,
            profileImage
        })

        await user.save()

        const token = generateToken(user._id)

        return response.status(201).json({success:true,token,user:{
            id:user._id,
            username:user.username,
            email:user.email,
            imageURL:user.profileImage,
            createdAt:user.createdAt
        }})
    }catch(error){
        return response.status(500).json({message:'something went wrong',error:error.message})
    }
    
}



export const login = async (request,response)=> {
    const {email,password} = request.body
    try{

        if(!email || !password) {
            return response.status(409).json({message:"All fields are required"})
        }

        const user = await User.findOne({email})
        if(!user){
            return response.status(409).json({message:"wrong email or user does not exist"})
        }

        const verifyPassword = await bcrypt.compare(password,user.password)

        if(!verifyPassword){
            return response.status(400).json({message:"invalid password"})
        }

        await user.save()

        const token = generateToken(user._id)

        return response.status(200).json({
            success:true,
            token,
            user:{
            id:user._id,
            username:user.username,
            email:user.email,
            imageURL:user.profileImage,
            createdAt:user.createdAt
            }
        })
    }catch(error){
        return response.status(500).json({success:false,message:error.message})
    }
}
