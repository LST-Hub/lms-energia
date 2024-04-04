import React, { useEffect, useState } from "react";
import { permissionTypeIds } from "../../../../DBConstants";
import { urls } from "../../../utils/Constants";

function NavData(user, sessionData) {
  const [isLead, setIsLead] = useState(false);
  const [iscurrentState, setIscurrentState] = useState(null);

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "lead") {
      setIsLead(false);
    }
  }, [iscurrentState]);

  const menuItemsForAll = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-fill",
      link: `${urls.dashboard}`,
    },

    {
      id: "leads",
      label: "Lead",
      icon: "ri-links-line",
      link: `${urls.lead}`,
    },
    {
      id: "phone call",
      label: "Phone Call",
      icon: "ri-phone-fill",
      link: `${urls.phoneCall}`,
    },
    {
      id: "task",
      label: "Task",
      icon: "ri-task-line",
      link: `${urls.taskk}`,
    },
    {
      id: "meeting",
      label: "Meeting",
      icon: "ri-calendar-line",
      link: `${urls.meeting}`,
    },
    {
      id: "users",
      label: "Users",
      icon: "ri-group-line",
      link: `${urls.users}`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "ri-settings-4-fill",
      link: `${urls.settings}`,
    },
  ];

  return menuItemsForAll;
}
export default NavData;
