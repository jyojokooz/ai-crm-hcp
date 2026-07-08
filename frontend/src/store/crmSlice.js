import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    hcpName: "",
    notes: "",
    topics: "",
    sentiment: "Neutral",
  },
  messages: [
    {
      role: "ai",
      text: "Hello! Describe your interaction with the HCP, and I will auto-fill the log for you.",
    },
  ],
  isLoading: false,
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { updateFormData, addMessage, setLoading } = crmSlice.actions;
export default crmSlice.reducer;
