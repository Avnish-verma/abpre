// src/services/sheetService.js

// 🔴 IMP: Step 2 mein mila hua naya URL yahan paste karein
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_akCjVZ-TrUkl1WQUx_EJ3FEAJ4z5Wu-ICNhEHo_8ctd9hZ8k3yZ7yR73UVqwUVl2/exec'; 

export const sheetService = {
  // 1. Get Quiz
  getQuiz: async (videoId) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getQuiz&videoId=${videoId}`);
      const result = await response.json();
      return result.status === 'success' ? result.data : [];
    } catch (error) {
      console.error("Error fetching quiz:", error);
      return [];
    }
  },

  // 2. Get Notes
  getNotes: async (videoId) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getNotes&videoId=${videoId}`);
      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return null;
    }
  },

  // 3. Save Quiz Questions (Admin Side)
  saveQuizQuestions: async (videoId, questions) => {
    try {
      // Data prepare karein
      const payload = {
        type: 'save_quiz',
        videoId: videoId,
        questions: questions
      };

      console.log("Sending to Sheet:", payload);

      // POST Request bhejein
      // 'no-cors' use nahi karna hai, Google Script JSON return karta hai
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // 'text/plain' CORS issues avoid karta hai google script ke sath
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.status === 'success') {
        return true;
      } else {
        console.error("Sheet Error:", result.message);
        return false;
      }
    } catch (error) {
      console.error("Network Error (saveQuiz):", error);
      alert("Server connection failed! Check console for details.");
      return false;
    }
  },

  // 4. Save Notes (Admin Side)
  saveNote: async (videoId, videoTitle, text) => {
    try {
      const payload = {
        type: 'note',
        videoId,
        videoTitle,
        text
      };

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Error saving note:", error);
      return false;
    }
  }
};