module.exports = {
    hello: ()=>'Hello world!!!',
    notes: async ({models})=>{
        return await models.Note.find();
    },
    note:async (parent,args,{models})=>{
        return await models.Note.findById(args.id);
    }

}