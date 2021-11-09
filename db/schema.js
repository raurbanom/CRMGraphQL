// Schema
const { gql } = require("apollo-server")

const typeDefs = gql`
    type User {
        id: ID
        firstName: String
        lastName: String
        email: String
        created: String
    }

    input UserInput {
        firstName: String
        lastName: String
        email: String
        password: String
    }

    type Query {
        getUser: String
    }

    type Mutation {
        newUser(input: UserInput): String
    }
`;

module.exports = typeDefs;