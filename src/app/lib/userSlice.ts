import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  token: string | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  id: null,
  firstName: null,
  lastName: null,
  token: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.firstName = null;
      state.lastName = null;
      state.token = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
