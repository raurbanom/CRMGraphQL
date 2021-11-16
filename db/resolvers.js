const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Order = require("../models/Order");

require("dotenv").config({ path: __dirname + "/../.env" });

const createToken = (currentUser, secretKey, expiresIn) => {
    const { id, email, firstName, lastName } = currentUser;

    return jwt.sign({ id, email, firstName, lastName }, secretKey, { expiresIn: expiresIn });
};

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, { token }) => {
            const user = await jwt.verify(token, process.env.SECRET_KEY);

            return user;
        },

        getProducts: async () => {
            try {
                const products = await Product.find({});

                return products;
            } catch (error) {
                console.log(error);
            }
        },
        getProduct: async (_, { id }) => {
            try {
                const product = await Product.findById(id);

                if (!product) {
                    throw new Error("Product not found!")
                }

                return product;
            } catch (error) {
                console.log(error);
            }
        },

        getClients: async () => {
            try {
                const clients = await Client.find({});

                return clients;
            } catch (error) {
                console.log(error);
            }
        },

        getClientsBySeller: async (_, { }, ctx) => {
            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() });

                return clients;
            } catch (error) {
                console.log(error);
            }
        },

        getClient: async (_, { id }, ctx) => {
            // Client exist!
            const client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found!");
            }

            // Client by seller
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials")
            }

            return client;
        },

        getOrders: async () => {
            try {
                const orderList = await Order.find({});

                return orderList;
            } catch (error) {
                console.log(error);
            }
        },
        getOrdersBySeller: async (_, { }, ctx) => {
            try {
                const orderList = await Order.find({ seller: ctx.user.id.toString() });

                return orderList;
            } catch (error) {
                console.log(error);
            }
        },
        getOrder: async (_, { id }, ctx) => {
            // Check If Order exist!
            const order = await Order.findById(id);

            if (!order) {
                throw new Error("Order not found!");
            }

            // Check the Order by seller
            if (order.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials")
            }

            return order;
        },

        getOrderByState: async (_, { state }, ctx) => {
            try {
                const orderList = await Order.find({
                    seller: ctx.user.id.toString(),
                    state: state
                });

                return orderList;
            } catch (error) {
                console.log(error);
            }
        },

        topClients: async () => {
            const clientList = await Order.aggregate([{
                $match: { state: "COMPLETED" }
            }, {
                $group: {
                    _id: "$client",
                    total: { $sum: "$total" }
                }
            }, {
                $lookup: {
                    from: "clients",
                    localField: "_id",
                    foreignField: "_id",
                    as: "client"
                }
            }, {
                $limit: 10
            }, {
                $sort: { total: -1 }
            }]);

            return clientList;
        },
        topSellers: async () => {
            const sellerList = await Order.aggregate([{
                $match: { state: "COMPLETED" }
            }, {
                $group: {
                    _id: "$seller",
                    total: { $sum: "$total" }
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "seller"
                }
            }, {
                $limit: 5
            }, {
                $sort: { total: -1 }
            }]);

            return sellerList;
        },
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

        },

        newProduct: async (_, { input }) => {
            try {
                const product = new Product(input);

                // Save on DB
                const result = await product.save();

                return result;
            } catch (error) {
                console.log(error);
            }
        },
        updateProduct: async (_, { id, input }) => {
            // Find product by id
            let product = await Product.findById(id);

            if (!product) {
                throw new Error("Product not found!")
            }

            // Save on DB
            product = await Product.findOneAndUpdate({ _id: id }, input, { new: true })

            return product;
        },
        deleteProduct: async (_, { id }) => {
            // Find product by id
            let product = await Product.findById(id);

            if (!product) {
                throw new Error("Product not found!")
            }

            // Save on DB
            await Product.findOneAndDelete({ _id: id })

            return "Product has been deleted!";
        },

        newClient: async (_, { input }, ctx) => {
            const { email } = input;

            // Client exists
            const existsClient = await Client.findOne({ email });

            if (existsClient) {
                throw new Error("Client already exists!")
            }

            const newClient = await Client(input);

            // Assign seller
            newClient.seller = ctx.user.id;

            // Save on DB
            try {
                const result = await newClient.save();

                return result;
            } catch (error) {
                console.log(error)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            // Check If user exist
            let client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found!")
            }

            // Check If seller is correct
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials")
            }

            // Save on DB
            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });

            return client;
        },

        deleteClient: async (_, { id }, ctx) => {
            // Find Client by id
            let client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found!")
            }

            // Check If seller is correct
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials")
            }

            // Delete on DB
            await Client.findOneAndDelete({ _id: id })

            return "Client has been deleted!";
        },

        newOrder: async (_, { input }, ctx) => {
            const { client } = input;

            // Check If client exist
            const existClient = await Client.findById(client);

            if (!existClient) {
                throw new Error("Client not found!");
            }

            // Check If seller is correct
            if (existClient.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials");
            }

            // Check the stock
            for await (const item of input.orderDetail) {
                const { id } = item;
                const product = await Product.findById(id);

                if (item.quantity > product.stock) {
                    throw new Error(`The product "${product.name}" exceeds the available quantity`)
                } else {
                    product.stock -= item.quantity;

                    await product.save();
                }
            }

            // Create new Order
            let newOrder = new Order(input);

            // Assign seller
            newOrder.seller = ctx.user.id;

            // Save on DB
            const result = await newOrder.save();

            return result;
        },

        updateOrder: async (_, { id, input }, ctx) => {
            const { client } = input;

            // Check If Order exist
            const existOrder = await Order.findById(id);

            if (!existOrder) {
                throw new Error("Order not found!");
            }

            // Check If Client exist
            const existClient = await Client.findById(client);

            if (!existClient) {
                throw new Error("Client not found!");
            }

            // Check If Seller is valid
            if (existClient.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials");
            }

            // Check stock
            if (input.orderDetail) {
                for await (const item of input.orderDetail) {
                    const { id } = item;
                    const product = await Product.findById(id);

                    if (item.quantity > product.stock) {
                        throw new Error(`The product "${product.name}" exceeds the available quantity`)
                    } else {
                        product.stock -= item.quantity; // Review stock

                        await product.save();
                    }
                }
            }

            // Save on DB
            const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true });

            return result;
        },
        deleteOrder: async (_, { id }, ctx) => {
            // Find Order by id
            let order = await Order.findById(id);

            if (!order) {
                throw new Error("Order not found!")
            }

            // Check If seller is correct
            if (order.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have credentials")
            }

            // Delete on DB
            await Order.findOneAndDelete({ _id: id })

            return "Order has been deleted!";
        }
    }
};

module.exports = resolvers;