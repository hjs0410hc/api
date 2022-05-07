const { UserInputError } = require("apollo-server-express");

module.exports = {
    hello: ()=>'Hello world!!!',
    notes: async (parent,args,{models})=>{
        return await models.Note.find();
    },
    note:async (parent,args,{models})=>{
        return await models.Note.findById(args.id);
    },
    user:async(parent,{username},{models})=>{
        return await models.User.findOne({username});
    },
    users:async(parent,args,{models})=>{
        return await models.User.find({});
    },
    me:async(parent,args,{models,user})=>{
        if(!user)throw new Error('you are guest');
        return await models.User.findById(user.id);
    }

}