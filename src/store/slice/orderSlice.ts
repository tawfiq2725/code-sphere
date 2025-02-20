import { createSlice } from "@reduxjs/toolkit";

interface OrderState {
  couponApplied: boolean;
  totalAmount: number;
  discountAmount: number;
  couponUser: string | null;
}

const initialState: OrderState = {
  couponApplied: false,
  totalAmount: 0,
  discountAmount: 0,
  couponUser: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    couponApply: (state, action) => {
      const { originalTotal, newTotal, userId } = action.payload;
      state.couponApplied = true;
      state.totalAmount = originalTotal;
      state.discountAmount = newTotal;
      state.couponUser = userId;
    },
    couponRemove: (state) => {
      state.couponApplied = false;
      state.discountAmount = 0;
      state.couponUser = null;
    },
  },
});

export const { couponApply, couponRemove } = orderSlice.actions;
export default orderSlice.reducer;
