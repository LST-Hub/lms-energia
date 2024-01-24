import create from "zustand";

const useGlobalStore = create((set) => ({
  isUserAuthenticated: false,
  setUserAuthenticated: (value) =>
    set(() => ({
      isUserAuthenticated: value,
    })),
  userRole: {},
  setUserRole: (value) => set(() => ({ userRole: value })),
  userSessionData: null,
  setUserSessionData: (value) => set(() => ({ userSessionData: value })),
}));

export default useGlobalStore;
