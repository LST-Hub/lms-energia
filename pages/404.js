import ErrorImg from "../public/images/error400-cover.png";
import Image from "next/future/image";
import TkContainer from "../src/components/TkContainer";

export default function Custom404() {
  return (
    <div className="page-content">
      <TkContainer>
        <Image
          src={ErrorImg}
          alt="Weekly Calender"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          layout="responsive"
        />
      </TkContainer>
    </div>
  );
}
