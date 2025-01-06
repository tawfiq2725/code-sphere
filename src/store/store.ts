import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

let persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export default () => {
  let store = configureStore({
    reducer: {
      auth: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

  let persistor = persistStore(store);
  return { store, persistor };
};
