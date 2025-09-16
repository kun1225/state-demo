import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const initialState = {
  todos: [
    {
      id: "1",
      text: "test",
      completed: false,
    },
  ] as Todo[],
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.todos.push(action.payload);
      },
      prepare(text: string) {
        return { payload: { id: crypto.randomUUID(), text, completed: false } };
      },
    },
  },
});

export const todosReducer = todosSlice.reducer;
export const todosActions = todosSlice.actions;

export const selectAllTodos = (s: any) => s.todos.todos;
