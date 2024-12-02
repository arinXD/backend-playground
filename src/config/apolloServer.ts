import { ApolloServer } from "@apollo/server";
import todoSchema from "../graphql/todo/todoSchema.js";
import todoResolver from "../graphql/todo/todoResolver.js";

const apolloServer = new ApolloServer({
    typeDefs: [todoSchema],
    resolvers: [todoResolver],
})

export default apolloServer