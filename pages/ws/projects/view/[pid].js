import { useRouter } from "next/router";
import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import ProjectDetails from "../../../../src/components/projects/ProjectDetails";

import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import TkLoader from "../../../../src/components/TkLoader";
import { modes, urls } from "../../../../src/utils/Constants";

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { pid } = router.query;
  
  return (
    <>
      <TkPageHead>
        {/* TODO: add project name in title */}
        <title>{`Project Details`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Project Details"} parentTitle="Projects" parentLink={`${urls.projects}`} />
        <TkContainer>
          <ProjectDetails id={pid} mode={modes.view} />
        </TkContainer>
      </div>
    </>
  );
};

export default ProjectDetailsPage;

ProjectDetailsPage.options = {
  layout: true,
  auth: true,
};
