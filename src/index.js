// index.js
// This is the main entry point of our application

require('dotenv').config();
const express = require('express');
const app = express();
const { ApolloServer, gql } = require('apollo-server-express');
const models = require('./models')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const db=require('./db')
const DB_HOST = process.env.DB_HOST;
const port = process.env.PORT || 4000;
db.connect(DB_HOST);

// ApolloServer Init ///////////////////////////////////////
const server = new ApolloServer({typeDefs,resolvers,
    context:()=>{
        return {models};
    }
});
server.applyMiddleware({app,path:'/api'});
////////////////////////////////////////////////////////////

// express routes


app.get('/',(req,res)=>{
    res.send('Hello World');
});

app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}${server.graphqlPath}`);
});