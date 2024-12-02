const todoSchema = `#graphql

scalar Date

type Todo {
    id: Int! #pk
    todo: String
    complete: Boolean
    created_at: Date
}

type ResponseType {
    todo: Todo
    message: String
}


type Query {
    todoes: [Todo],
    getTodoByID(id: Int): Todo
}

type Mutation {
    createTodo(todo: String): Todo
    updateTodo(id: Int, todo: String): ResponseType
    completeTodo(id: Int): ResponseType
    deleteTodo(id: Int): String
}
`

export default todoSchema