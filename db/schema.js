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

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        firstName: String
        lastName: String
        company: String
        email: String
        phone: String
        created: String
        seller: ID
    }

    input UserInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        firstName: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        # Clients
        getClients: [Client]
        getClientsBySeller: [Client]
        getClient(id: ID!): Client
    }

    type Mutation {
        # Users
        newUser(input: UserInput): User
        authenticateUser(input: AuthenticateInput): Token

        # Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        # Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String
    }
`;

module.exports = typeDefs;