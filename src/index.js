// index.js
// This is the main entry point of our application

const express = require('express');
require('dotenv').config();
const db=require('./db')
const DB_HOST = process.env.DB_HOST;
db.connect(DB_HOST);
const models = require('./models')
const app = express();
const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = gql`
type Query{
    hello:String!
    notes: [Note!]!
    note(id:ID!): Note!
}

type Note{
    id: ID!
    content: String!
    author: String!
}

type Mutation{
    newNote(content: String!): Note!
}
`;
const resolvers = {
    Query:{
        hello: ()=>'Hello world!!!',
        notes: async ()=>{
            return await models.Note.find();
        },
        note:async (parent,args)=>{
            return await models.Note.findById(args.id);
        }
    },
    Mutation:{
        newNote:async (parent,args)=>{
            return await models.Note.create({
                content:args.content,
                author:'Adam Scott'
            })
        }
    }
};

let notes = [
    {id:'1',content:'This is a note',author:'Adam Scott'},{id:'2',content:'This is another note',author:'Harlow Everly'},{id:'3',content:'This is 3nother note',author:'Riley Harrison'},
];

const server = new ApolloServer({typeDefs,resolvers});
server.applyMiddleware({app,path:'/api'});

const port = process.env.PORT || 4000;


app.get('/',(req,res)=>{
    res.send('Hello World');
});

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}${server.graphqlPath}`);
});