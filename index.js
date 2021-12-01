const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");

const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

const connectDB = require("./config/db");

require("dotenv").config({ path: __dirname + "/.env" });

// Connect to DB
connectDB();

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers["authorization"] || "";

        if (token) {
            try {
                const user = jwt.verify(token.trim().replace("Bearer ", ""), process.env.SECRET_KEY);
                return {
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

});

// Listen and running server
server.listen().then(({ url }) => {
    console.log(`Listening to requests on ${url}`);
});
