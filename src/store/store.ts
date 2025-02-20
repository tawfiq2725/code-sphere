import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import orderReducer from "./slice/orderSlice";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);
const persistOrderReducer = persistReducer(persistConfig, orderReducer);

const createStore = () => {
  const store = configureStore({
    reducer: {
      auth: persistedReducer,
      order: persistOrderReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

  const persistor = persistStore(store);
  return { store, persistor };
};

export default createStore;
