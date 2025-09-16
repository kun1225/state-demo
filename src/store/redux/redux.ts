import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import { preferencesActions, preferencesReducer } from "./preferencesSlice";
import { fetchUsersPage, usersReducer } from "./usersSlice";
import { todosReducer } from "./todosSlice";

// Listener: when query/limit changes, refetch first page and replace
const listener = createListenerMiddleware();
listener.startListening({
  matcher: isAnyOf(preferencesActions.setQuery, preferencesActions.setLimit),
  effect: async (_action, api) => {
    const state = api.getState() as {
      preferences: { q: string; limit: number };
    };
    const q = state.preferences.q || undefined;
    const limit = state.preferences.limit;
    api.dispatch(fetchUsersPage({ q, limit, cursor: null, replace: true }));
  },
});

// Persistence middleware: persist preferences to localStorage (client only)
const persistPreferences: Parameters<typeof configureStore>[0]["middleware"] = (
  getDefault
) =>
  getDefault().concat(
    listener.middleware,
    (storeApi) => (next) => (action: any) => {
      const result = next(action);
      if (
        action.type.startsWith("preferences/") &&
        typeof window !== "undefined" &&
        window?.localStorage
      ) {
        const { preferences } = storeApi.getState() as {
          preferences: { q: string; limit: number };
        };
        try {
          window.localStorage.setItem("prefs", JSON.stringify(preferences));
        } catch {}
      }
      return result;
    }
  );

export const store = configureStore({
  reducer: {
    users: usersReducer,
    preferences: preferencesReducer,
    todos: todosReducer,
  },
  middleware: persistPreferences,
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
