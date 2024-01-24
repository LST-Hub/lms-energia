import React from "react";
import TkAlert from "../TkAlert";
import Image from "next/future/image";
import clientSidebar from "../../../public/images/help/client-sidebar.png";
import clientForm from "../../../public/images/help/client-add.png";

function ClientHelp() {
  return (
    <div className="table-text">
      <h3>
        <strong>Step 1: Accessing the Client Module</strong>
      </h3>
      <span>
        Navigate to the sidebar and click on the &quot;Clients&quot; section. This will take you to the client
        management area.
      </span>
      <br />
      <Image
        src={clientSidebar}
        alt="Weekly Calender"
        style={{ width: "20%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <h3>
        <strong>Step 2: Adding a New Client:</strong>
      </h3>
      <span>
        In the client management area, locate and click on the &quot;Add Client&quot; button. This action will initiate
        the process of creating a new client entry.
      </span>
      <br />
      <br />
      <h3>
        <strong>Step 3: Filling Out the Client Form:</strong>
      </h3>
      <span>After clicking &quot;Add Client&quot; a new form will appear for you to input client information.</span>
      <br />
      <span>Complete the required fields on the form:</span>
      <span>
        <ul>
          <li>
            <span>
              <strong>Client Name: </strong>
            </span>
            Enter the name of the client.
          </li>
          <li>
            <span>
              <strong>Email: </strong>
            </span>
            Input the client&#39;s email address.
          </li>
          <li>
            <span>
              <strong>Phone: </strong>
            </span>
            Enter the client&#39;s phone number.
          </li>
          <li>
            <span>
              <strong>Note: </strong>
            </span>
            Include any relevant notes or information about the client.
          </li>
        </ul>
      </span>
      <Image
        src={clientForm}
        alt="Weekly Calender"
        style={{ width: "60%", height: "100%", objectFit: "contain" }}
        layout="responsive"
      />
      <br />
      <br />
      <TkAlert color="warning">
        Please ensure that all mandatory fields, marked with an asterisk or other indicators, are filled in with
        accurate and relevant information. These fields are essential for creating a complete client profile.
      </TkAlert>
    </div>
  );
}

export default ClientHelp;
