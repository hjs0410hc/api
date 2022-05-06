const {gql} = require('apollo-server-express');

module.exports = gql`
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