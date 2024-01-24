import React from "react";
import BreadCrumb from "../../../src/utils/BreadCrumb";
import AllProjects from "../../../src/components/projects/AllProjects";
import { useRouter } from "next/router";

import TkPageHead from "../../../src/components/TkPageHead";
import TkContainer from "../../../src/components/TkContainer";

import { perAccessIds, permissionTypeIds } from "../../../DBConstants";
import useUserAccessLevel from "../../../src/utils/hooks/useUserAccessLevel";
import { urls } from "../../../src/utils/Constants";

const ProjectList = () => {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push(`${urls.projectAdd}`);
  };

  const accessLevel = useUserAccessLevel(permissionTypeIds.projAndTask);

  return (
    <>
      <TkPageHead>
        <title>Projects</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle="Projects"
          buttonText={accessLevel >= perAccessIds.create ? "Add Project" : undefined}
          onButtonClick={accessLevel >= perAccessIds.create ? handleButtonClick : undefined}
        />
        <TkContainer>
          <AllProjects accessLevel={accessLevel} />
        </TkContainer>
      </div>
    </>
  );
};

export default ProjectList;

ProjectList.options = {
  layout: true,
  auth: true,
};
