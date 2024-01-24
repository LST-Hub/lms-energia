import React, { useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";
import AccessRightsHelp from "./AccessRightsHelp";
import InviteUsersHelp from "./InviteUsersHelp";
import WorkCalendarHelp from "./WorkCalendarHelp";
import ClientsHelp from "./ClientsHelp";
import ProjectsHelp from "./ProjectsHelp";
import TasksHelp from "./TasksHelp";
import ReportsHelp from "./ReportsHelp";
import TodaysTaskHelp from "./TodaysTaskHelp";
import TimesheetHelp from "./TimesheetHelp";
import ExpenseHelp from "./ExpenseHelp";
import ResourceAllocationHelp from "./ResourceAllocationHelp";
import ApprovalsHelp from "./ApprovalsHelp";
function HelpAccordion() {
  const [open, setOpen] = useState("");
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  return (
    <div>
      <Accordion flush open={open} toggle={toggle}>
        <AccordionItem>
          <AccordionHeader targetId="1">
            <h2>Access Rights</h2>
          </AccordionHeader>
          <AccordionBody accordionId="1">
            <AccessRightsHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="2">
            <h2>Inviting Users</h2>
          </AccordionHeader>
          <AccordionBody accordionId="2">
            <InviteUsersHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="3">
            <h2>Manage Workspace</h2>
          </AccordionHeader>
          <AccordionBody accordionId="3">
            <WorkCalendarHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="4">
            <h2>Clients</h2>
          </AccordionHeader>
          <AccordionBody accordionId="4">
            <ClientsHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="5">
            <h2>Projects</h2>
          </AccordionHeader>
          <AccordionBody accordionId="5">
            <ProjectsHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="6">
            <h2>Tasks</h2>
          </AccordionHeader>
          <AccordionBody accordionId="6">
            <TasksHelp />
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="7">
            <h2>Reports</h2>
          </AccordionHeader>
          <AccordionBody accordionId="7">
            < ReportsHelp/>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="8">
            <h2>Timesheet</h2>
          </AccordionHeader>
          <AccordionBody accordionId="8">
            < TimesheetHelp/>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="9">
            <h2>Todays Task</h2>
          </AccordionHeader>
          <AccordionBody accordionId="9">
            < TodaysTaskHelp/>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="10">
            <h2>Expense</h2>
          </AccordionHeader>
          <AccordionBody accordionId="10">
            < ExpenseHelp/>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="11">
            <h2>Resource Allocation</h2>
          </AccordionHeader>
          <AccordionBody accordionId="11">
            < ResourceAllocationHelp/>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader targetId="12">
            <h2>Approvals</h2>
          </AccordionHeader>
          <AccordionBody accordionId="12">
            < ApprovalsHelp/>
          </AccordionBody>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default HelpAccordion;
