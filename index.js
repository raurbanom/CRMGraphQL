const { ApolloServer } = require("apollo-server");

const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        const id = 20;
        const myContext = "Hi";
        return {
            myContext
        }
    }

});

// Listen and running server
server.listen().then(({ url }) => {
    console.log(`Listening to requests on ${url}`);
});
