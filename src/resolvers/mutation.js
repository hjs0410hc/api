const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
const{AuthenticationError,ForbiddenError} = require('apollo-server-express')
require('dotenv').config();
const mongoose = require('mongoose')
const gravatar = require('../util/gravatar')

module.exports = {
    newNote:async (parent,args,{models,user})=>{
        if(!user){
            throw new AuthenticationError('You must be signed in to create a note')
        }
        return await models.Note.create({
            content:args.content,
            author:mongoose.Types.ObjectId(user.id)
        })
    },
    deleteNote:async(parent,{id},{models,user})=>{
        if(!user){
            throw new AuthenticationError('You must be signed in to create a note')
        }

        const note = await models.Note.findById(id);
        if(!note){
            throw new Error('Cannot find the note')
        }else if(String(note.author) !== user.id){
            throw new ForbiddenError("You don't have permissions to delete the note")
        }

        try{
            await note.remove();
            return true;
        }catch(err){
            return false;
        }
    },
    updateNote:async(parent,{content,id},{models,user})=>{
        if(!user){
            throw new AuthenticationError('You must be signed in to update a note')
        }
        const note = await models.Note.findById(id);
        if(!note){
            throw new Error('Cannot find the note')
        }else if(String(note.author) !== user.id){
            throw new ForbiddenError("You don't have permissions to delete the note")
        }
        
        return await models.Note.findOneAndUpdate( // note.update()?
            {
                _id:id,
            },
            {
                $set:{
                    content
                }
            },
            {
                new:true
            }
        )
    },
    signUp: async(parent,{username,email,password},{models})=>{
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password,10);
        const avatar = gravatar(email);
        try{
            const user=  await models.User.create({
                username,email,avatar,password:hashed
            });

            return jwt.sign({id:user._id},process.env.JWT_SECRET);
        }catch(err){
            console.log(err);
            throw new Error('Error creating account')
        }
    },
    signIn: async(parent,{username,email,password},{models})=>{
        if(email){
            email = email.trim().toLowerCase();
        }
        const user = await models.User.findOne({
            $or: [{email},{username}]
        });

        if(!user){
            throw new AuthenticationError('Error Signing in')
        }

        const valid = await bcrypt.compare(password,user.password);
        if(!valid){
            throw new AuthenticationError('Error Signing in')
        }

        return jwt.sign({id:user._id},process.env.JWT_SECRET);
    },
    toggleFavorite:async(parent,{id},{models,user})=>{ // 계속 Note의 updatedAt을 갱신시킴..
        if(!user){
            throw new AuthenticationError('NO USER DATA')
        }

        let noteCheck = await models.Note.findById(id);
        const hasUser = noteCheck.favoritedBy.indexOf(user.id);

        if(hasUser >= 0){
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $pull:{
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc:{
                        favoriteCount: -1
                    }
                },
                {
                    new:true
                }
            )
        }else{
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $push:{
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc:{
                        favoriteCount: 1
                    }
                },
                {
                    new:true
                }
            )
        }
    }
    
}