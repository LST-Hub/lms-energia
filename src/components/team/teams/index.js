import React,{useState, useEffect} from "react";
// import BreadCrumb from '../../../Components/Common/BreadCrumb';
// import AllTasks from '../../src/components/client/AllTasks';
// import Widgets from '../../src/components/client/Widgets';
import Team from "../Team";
import BreadCrumb from "../../../utils/BreadCrumb";

import TkPageHead from "../../TkPageHead";
import TkContainer from "../../TkContainer";
import TkLoader from "../../TkLoader";

const ClientList = () => {
  const [hideLoader, setHideLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHideLoader(false);
    }, 3000);
  },[])
    
  return (
    <React.Fragment>
      <TkPageHead>
        <title>{`Teams`}</title>
      </TkPageHead>
      <div className="page-content">
        <BreadCrumb pageTitle={"Team"} />
        <TkContainer>
          {hideLoader ? <TkLoader /> : <Team />}
        </TkContainer>
      </div>
    </React.Fragment>
  );
};

export default ClientList;

ClientList.options = {
  layout: true,
  auth: true,
};