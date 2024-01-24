import React from "react";
import noData from "../../public/images/file.png";
import Image from "next/image";
import TkContainer from "../../src/components/TkContainer";

function TkNoData() {
  return (
    <div className="no-data">
      <TkContainer>
        <Image
          src={noData}
          alt="No Data"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          layout="responsive"
        />
      </TkContainer>
      <div className="no-data-text">
        <h4>No data to display</h4>
      </div>
    </div>
  );
}

export default TkNoData;
