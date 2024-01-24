import Link from "next/link";
import QuestionsAfterSignup from "../src/components/questionsAfterSignup/QuestionsAfterSignup";
import TkContainer from "../src/components/TkContainer";
import TkPageHead from "../src/components/TkPageHead";

export default function Start() {
  return (
    <div>
      <TkPageHead>
        <title>{"Questions after Signup"}</title>
      </TkPageHead>
      <div className="page-content overflow-hidden">
        <TkContainer>
          <QuestionsAfterSignup />
        </TkContainer>
      </div>
    </div>
  );
}


Start.options = {
  auth: true,
};