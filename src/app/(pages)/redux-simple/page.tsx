"use client";

import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";

import { todosActions } from "@/store/redux/todosSlice";

import type { Todo } from "@/store/redux/todosSlice";

export default function ReduxSimplePage() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state: any) => state.todos.todos) as Todo[];
  console.log("🚀 ~ ReduxSimplePage ~ todos:", todos);

  function handleAddTodo() {
    dispatch(todosActions.addTodo("test"));
  }

  return (
    <div>
      <div>
        <h1>Todos</h1>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
