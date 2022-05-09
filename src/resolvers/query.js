const { UserInputError } = require("apollo-server-express");
const { modelSchemas } = require("mongoose");

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
    },
    noteFeed:async(parent,{cursor},{models})=>{
        const limit = 10; // hardcoded limit
        let hasNextPage = false;
        let cursorQuery={};

        if(cursor){
            cursorQuery={_id:{$lt:cursor}} // cursor=note._id: 시간값 정렬된 String. 따라서 이것보다 Less Than 하면 이것보다 오래된 걸 가져옴.. 아무튼 최신을 먼저 가져옴!
        }
        let notes = await models.Note.find(cursorQuery)
                            .sort({_id:-1})
                            .limit(limit+1); // 11개 가져와요 아무튼.
        if(notes.length > limit){
            hasNextPage = true;
            notes = notes.slice(0,-1); // 11->10개
        }

        const newCursor=notes[notes.length-1]._id;

        return{
            notes,
            cursor:newCursor,
            hasNextPage
        };
    }

}