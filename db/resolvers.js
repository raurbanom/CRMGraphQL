const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

require("dotenv").config({ path: __dirname + "/../.env" });

const createToken = (currentUser, secretKey, expiresIn) => {
    const { id, email, firstName, lastName } = currentUser;

    return jwt.sign({ id, email, firstName, lastName }, secretKey, { expiresIn: expiresIn });
};

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.SECRET_KEY)

            return userId;
        }
    },
    Mutation: {
        newUser: async (_, { input }) => {
            const { email, password } = input;
            // Review user not exist
            const existsUser = await User.findOne({ email });
            if (existsUser) {
                throw new Error("User already exists!")
            }

            // Hashing the password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                // Save to DB
                const newUser = new User(input);
                newUser.save();

                return newUser;
            } catch (error) {
                console.log(error);
            }
        },
        authenticateUser: async (_, { input }) => {
            const { email, password } = input;

            // User exists
            const existsUser = await User.findOne({ email });

            if (!existsUser) {
                throw new Error("User does not exist!")
            }

            // Review the password is valid
            const isValidPassword = await bcryptjs.compare(password, existsUser.password)

            if (!isValidPassword) {
                throw new Error("The password is not valid");
            }

            // Create token
            return {
                token: createToken(existsUser, process.env.SECRET_KEY, "24h")
            }

        }
    }
};

module.exports = resolvers;