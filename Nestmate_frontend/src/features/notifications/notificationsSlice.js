import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markRead: (state, action) => {
      const n = state.items.find((i) => i._id === action.payload);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
     markNotificationRead: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    }
  },
});

export const { setNotifications, addNotification, markRead, markAllRead, markNotificationRead, 
  markAllNotificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
