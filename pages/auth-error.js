import { FormErrorBox } from "../src/components/forms/ErrorText";
import TkButton from "../src/components/TkButton";
import TkContainer from "../src/components/TkContainer";
import { urls } from "../src/utils/Constants";

export default function Error() {
  const routeLogin = () => {
    // not used router.push here as doing tab refresh may solve some issues
    window.location.href = `${urls.login}`;
  };
  return (
    <>
      <TkContainer>
        <FormErrorBox errMessage="Some Error occured while login. Please try again." />
        <TkButton onClick={routeLogin} color="primary">
          Login Again
        </TkButton>
      </TkContainer>
    </>
  );
}
