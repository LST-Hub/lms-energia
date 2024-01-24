import React from "react";
import Image from "next/future/image";
import TkAlert from "../TkAlert";
import usersSidebar from "../../../public/images/help/user-sidebar.png";
import usersPage from "../../../public/images/help/user-invite.png";
import userIndex from "../../../public/images/help/user-index.png";
import userEmail from "../../../public/images/help/user-email.png";

function InviteUsersHelp() {
  return (
    <div className="table-text">
      <span>
        {" "}
        As an administrator or project admin in our TaskSprint application, you have the ability to invite new users to
        join your workspace. Inviting users is a simple process that enables you to collaborate effectively within your
        projects. Here&#39;s a step-by-step guide on how to invite users:
      </span>
      <br />
      <br />
      <h3>
        <strong>Step 1: Access User Invitation</strong>
      </h3>
      <span>Look for the &quot;Users&quot; section. This is usually located in the sidebar area of the workspace.</span>
      <br />
      <Image
        src={usersSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <span>On the right side of the screen, you will find the &quot;Invite Users&quot; button.</span> <br />
      <Image
        src={userIndex}
        alt="Weekly Calender"
        style={{ width: "30%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <h3>
        <strong>Step 2: Invite Users</strong>
      </h3>
      <span>1. A new invitation form will appear. Fill in the following basic information for the user.</span>
      <span>
        <ul>
          <li>
            <span>
              <strong>User&#39;s Name: </strong>
            </span>
            Enter the full name of the user you are inviting.
          </li>
          <li>
            <span>
              <strong>Email Address: </strong>
            </span>
            Input the user&#39;s email address. This is where the user will receive the invitation.
          </li>
          <li>
            <span>
              <strong>Role: </strong>
            </span>
            Select the appropriate role for the user. You can typically choose from options like &quot;Admin&quot;,
            &quot;Project Admin&quot;, &quot;Project Manager&quot;, and &quot;Employee&quot;.
          </li>
          <li>
            <span>
              <strong>Work Calendar: </strong>
            </span>
            Choose the work calendar associated with this user. This helps align project timelines and scheduling.
          </li>
        </ul>
      </span>
      <span>
        2. Once you&#39;ve filled in the required information, click the &quot;Invite&quot; button. An email containing
        the invitation will be sent to the provided email address.
      </span>
      <div classname="text-center">
        <Image
          src={usersPage}
          alt="Weekly Calender"
          style={{ width: "60%", height: "100%", objectFit: "contain" }}
          layout="responsive"
        />
      </div>
      <br />
      <br />
      <h3>
        <strong>Step 3: User Accepts Invitation</strong>
      </h3>
      <span>
        1. The invited user will receive an email containing the invitation to join the workspace. The email will
        include a link to accept the invitation.
      </span>
      <div classname="text-center">
        <Image
          src={userEmail}
          alt="Weekly Calender"
          style={{ width: "60%", height: "100%", objectFit: "contain" }}
          layout="responsive"
        />
      </div>
      <span>
        2. Upon clicking the invitation link, the user will be directed to a page where they can create their password
        for TaskSprint.
      </span>
      <br />
      <span>3. After creating the password, the user will gain access to the application and the workspace.</span>
      <br />
      <br />
      <h3>
        <strong>Step 4: User Profile Completion</strong>
      </h3>
      <span>
        1. Once the user has accepted the invitation and logged in, they will be prompted to complete their profile.
      </span>
      <br />
      <span>
        2. The user can update their basic information, except for the email address and work calendar. This includes
        their name and any other relevant details.
      </span>
      <br />
      <br />
      <TkAlert color="warning">
        Make sure to manage user roles carefully to maintain proper access levels within the application.
      </TkAlert>
    </div>
  );
}

export default InviteUsersHelp;
