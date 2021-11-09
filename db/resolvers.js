// Resolvers
const resolvers = {
    Query: {
        getUser: () => "raurbanom",
    },
    Mutation: {
        newUser: (_, { input }) => {
            console.log(input)
            return "Creating a new user";
        }
    }
};

module.exports = resolvers;