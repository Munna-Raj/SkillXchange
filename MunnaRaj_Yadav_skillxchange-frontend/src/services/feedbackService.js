import api from "./api";

// Create a new feedback
export const createFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);
  return response.data;
};

// Get feedback for a user
export const getFeedbackForUser = async (userId) => {
  const response = await api.get(`/feedback/${userId}`);
  return response.data;
};
