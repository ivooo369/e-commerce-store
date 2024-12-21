import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  firstName: string | null;
  lastName: string | null;
  authToken: string | null;
}

const initialState: UserState = {
  firstName: null,
  lastName: null,
  authToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.authToken = action.payload.authToken;
    },
    clearUser(state) {
      state.firstName = null;
      state.lastName = null;
      state.authToken = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
