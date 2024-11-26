import prisma from "../../config/database.js"

const todoResolver = {
    Query: {
        todoes: async () => {
            const todoes = await prisma.todo.findMany({
                orderBy: { created_at: "desc" }
            })
            return todoes
        },
        getTodoByID: async (_, { id }) => await prisma.todo.findUnique({
            where: { id }
        })
    },
    Mutation: {
        createTodo: async (_, { todo }) => {
            const newTodo = await prisma.todo.create({
                data: {
                    todo,
                    complete: false
                }
            })
            return newTodo
        },
        updateTodo: async (_, { id, todo }) => {
            const updatedTodo = await prisma.todo.update({
                data: {
                    todo
                },
                where: {
                    id
                }
            })
            return {
                todo: updatedTodo,
                message: `Todo ID ${id} is updated.`
            }
        },
        completeTodo: async (_, { id }) => {
            const updatedTodo = await prisma.todo.update({
                data: {
                    complete: true
                },
                where: {
                    id
                }
            })
            return {
                todo: updatedTodo,
                message: `Todo ID ${id} is completed.`
            }
        },
        deleteTodo: async (_, { id }) => {
            await prisma.todo.delete({
                where: {
                    id
                }
            })
            return `Todo ID ${id} has been deleted.`
        },
    }
}

export default todoResolver