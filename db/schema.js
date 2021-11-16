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

    type Order {
        id: ID,
        orderDetail: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        state: StateOrder
        created: String
    }

    type OrderGroup {
        id: ID
        quantity: Int
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
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

    input OrderProductInput {
       id: ID
       quantity: Int

    }

    input OrderInput {
        orderDetail: [OrderProductInput]
        total: Float
        client: ID!
        state: StateOrder
    }

    enum StateOrder {
        PENDING
        COMPLETED
        CANCELLED
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

        # Orders
        getOrders: [Order]
        getOrdersBySeller: [Order]
        getOrder(id: ID!): Order
        getOrderByState(state: String): [Order]

        # Advanced Searches
        topClients: [TopClient]
        topSellers: [TopSeller]
        searchProduct(query: String!): [Product]
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

        # Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }
`;

module.exports = typeDefs;