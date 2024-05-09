import React, { useEffect, useState } from "react";
import { permissionTypeIds } from "../../../../DBConstants";
import { urls } from "../../../utils/Constants";

function NavData(user, sessionData) {
  const [isLead, setIsLead] = useState(false);
  const [iscurrentState, setIscurrentState] = useState(null);

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        console.log("id", id);
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  function handleLeadClick(e) {
    e.preventDefault();
    setIsLead(!isLead);
    setIscurrentState("lead");
    updateIconSidebar(e);
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "leads") {
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
      label: "Leads",
      icon: "ri-team-fill",
      link: "/#",
      stateVariables: isLead,
      click: handleLeadClick,
      subItems: [
        {
          id: "add-leads",
          label: "Add Lead",
          icon: "ri-links-line",
          link: `${urls.lead}`,
          parentId: "leads",
        },

        {
          id: "activity",
          label: "Activity",
          icon: "ri-links-line",
          link: `${urls.activity}`,
          parentId: "leads",
        },
      ],
    },

    // {
    //   id: "leads",
    //   label: "Lead",
    //   icon: "ri-links-line",
    //   link: "/#",
    //   stateVariables: isLead,
    //   click: handleLeadClick,
    //   subItems: [
    //     {
    //       id: "add-lead",
    //       label: "add Lead",
    //       link: `${urls.lead}`,
    //       parentId: "leads",
    //     },
    //     {
    //       id: "activity",
    //       label: "Activity",
    //       link: `${urls.activity}`,
    //       parentId: "leads",
    //     },
    //   ],
    // },

    // {
    //   id: "leads",
    //   label: "Lead",
    //   icon: "ri-links-line",
    //   link: `${urls.lead}`,
    // },

    {
      id: "users",
      label: "Users",
      icon: "ri-group-line",
      link: `${urls.users}`,
    },
    {
      id: "roles",
      label: "Roles",
      icon: "ri-user-settings-fill",
      link: `${urls.roles}`,
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
