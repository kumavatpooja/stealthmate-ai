// src/utils/planUtils.js

export const getPlanLimit = (plan) => {
    switch (plan) {
      case "Pro (200 Questions/Day)":
        return 200;
      case "Basic (100 Questions/Day)":
        return 100;
      default:
        return 3; // Free plan
    }
  };
  
  export const resetDailyLimitIfNeeded = () => {
    const lastUsedDate = localStorage.getItem("last_used_date");
    const today = new Date().toDateString();
  
    if (lastUsedDate !== today) {
      localStorage.setItem("daily_questions", "0");
      localStorage.setItem("last_used_date", today);
    }
  };
  