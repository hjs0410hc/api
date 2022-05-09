// index.js
// This is the main entry point of our application

require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet')
const cors = require('cors') // cross-origin resource sharing
app.use(helmet());
app.use(cors()); // must set CORS policy due to security issue.
const { ApolloServer, gql } = require('apollo-server-express');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity')
const jwt = require('jsonwebtoken');
const models = require('./models')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const db=require('./db')
const DB_HOST = process.env.DB_HOST;
const port = process.env.PORT || 4000;
db.connect(DB_HOST);

const getUser = token=>{
    if(token){
        try{
            return jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            throw new Error('Session invalid');
        }
    }
}


// ApolloServer Init ///////////////////////////////////////
const server = new ApolloServer({typeDefs,resolvers,
    validationRules:[depthLimit(5),createComplexityLimitRule(1000)],
    context:({req})=>{
        const token = req.headers.authorization;
        const user = getUser(token);
        console.log(user);
        return {models,user};
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