import React from "react";
import BreadCrumb from "../../../../src/utils/BreadCrumb";
import EditTodayTask from "../../../../src/components/TodaysTasks/EditTodaysTasks";
import TkPageHead from "../../../../src/components/TkPageHead";
import TkContainer from "../../../../src/components/TkContainer";
import { useRouter } from "next/router";
import { modes, urls } from "../../../../src/utils/Constants";

const TodayTaskPage = () => {
  const router = useRouter();
  const { did } = router.query;
  return (
    <>
      <TkPageHead>
        <title>{"Today's Tasks Details"}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb
          pageTitle={"Today's Task Details"}
          parentTitle="Today's Task"
          parentLink={`${urls.todaysTasks}`}
        />
        <TkContainer>
          <EditTodayTask id={did} mode={modes.edit}/>
        </TkContainer>
      </div>
    </>
  );
};

export default TodayTaskPage;

TodayTaskPage.options = {
  layout: true,
  auth: true,
};
