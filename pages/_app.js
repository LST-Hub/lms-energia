import { useEffect, createContext } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import "../styles/globals.css";
import "../styles/scss/themes.scss";
import "../styles/custom.scss";
import Layout from "../src/components/layout";
import { AuthContext } from "../src/utils/Contexts";
import { Slide, ToastContainer } from "react-toastify";
import { useRouter } from "next/router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

import TkNetworkStatus from "../src/components/TkNetworkStatus";
import useGlobalStore from "../src/utils/globalStore";
import TkButton from "../src/components/TkButton";
import { urls } from "../src/utils/Constants";
import { Spinner } from "reactstrap";
import TkContainer from "../src/components/TkContainer";

export default function MyApp({ Component, pageProps }) {
  // console.log("App rerendered");
  useEffect(() => {
    // <html lang="en" data-layout-style="default" data-sidebar-size="lg" data-sidebar="dark" data-layout-mode="light" data-layout-width="fluid" data-layout-position="fixed" data-topbar="light" data-layout="vertical" data-sidebar-image="none"></html>
    function changeHTMLAttribute(attribute, value) {
      if (document && document.documentElement) document.documentElement.setAttribute(attribute, value);
    }
    // we have added the below attributes to HTML tag beacuse we are using a website template and template id dependent on this attributes
    //the styling in scss files is done with respect to the below attributes in html
    changeHTMLAttribute("data-layout-style", "default");
    changeHTMLAttribute("data-sidebar-size", "lg");
    changeHTMLAttribute("data-sidebar", "dark");
    changeHTMLAttribute("data-layout-mode", "light");
    changeHTMLAttribute("ddata-layout-width", "fluid");
    changeHTMLAttribute("data-layout-position", "fixed");
    changeHTMLAttribute("data-topbar", "light");
    changeHTMLAttribute("data-layout", "vertical");
    changeHTMLAttribute("data-sidebar-image", "none");
  }, []);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={10000}
        closeButton={true}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        transition={Slide}
      />
      <TkNetworkStatus />
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={pageProps.session}>
          <AuthWrap wrap={Component?.options?.auth}>
            <LayoutWrap wrap={Component?.options?.layout}>
              <Component {...pageProps} />
            </LayoutWrap>
          </AuthWrap>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}

function AuthenticateUser({ children }) {
  const [setUserAuthenticated, setUserSessionData] = useGlobalStore((state) => [
    state.setUserAuthenticated,
    state.setUserSessionData,
  ]);

  //if you want to remove next-auth and wwant to reimplement this compoennt the replacee useSession from login and signup page also, i have used it there also
  const router = useRouter();
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const session = useSession({
    required: true,
    onUnauthenticated() {
      // If The user is not authenticated, handle it here.
      // when user is not authenticated, this function will be called

      // below comment is applicable if you make redirect=fasle in signout function of next-auth, but we have not passed redirect=false in signout function,
      // so below comment dosent apply, if you ever make redirect=false in signout function of next-auth, then below comment will apply

      // if user clicks logout button this function will be called, because when we call signOut() function of next-auth it signout user and clear his data from browser, and then it changes the session context and rerender the Auth component
      // and as user has logged out so it will be unauthenticated and this function will be called
      router.push(`${urls.login}`);
    },
  });

  if (session.status === "loading") {
    //TODO: show a loader
    return (
      <div className="page-loader">
        {" "}
        <Spinner
          color="primary"
          style={{
            height: "10rem",
            width: "10rem",
          }}
          type="grow"
        >
          Loading...
        </Spinner>
      </div>
    );
  }

  if (session.status !== "authenticated") {
    // console.log("redirecting to login page");
    router.push(`${urls.login}`);
    return <div>Access Denied!. Please Login to Access Application.</div>;
  }
  if (session.status === "authenticated") {
    setUserAuthenticated(true);
    setUserSessionData(session.data);

    // if user dont have workspace, means he has signed up but not created workspace, so redirect him to create workspace page
    if (!session.data.user.workspaceId && !router.pathname.includes(`${urls.start}`)) {
      router.push(`${urls.start}`);
      return <div>Loading...</div>;
    }
  }
  return <AuthContext.Provider value={session.data}>{children}</AuthContext.Provider>;
}

function Auth({ children }) {
  const [isUserAuthenticated, sessionData, setUserAuthenticated, setUserSessionData] = useGlobalStore((state) => [
    state.isUserAuthenticated,
    state.userSessionData,
    state.setUserAuthenticated,
    state.setUserSessionData,
  ]);
  const router = useRouter();
  const signOutHandler = async () => {
    setUserAuthenticated(false);
    setUserSessionData(null);
    // dont keep redirect to false, as it creates a problem currently
    // if we keep redirect redirect to false, it dont refresh the tab and setuserauthenticated cals with false, this rerender the Auth Component in _app.js,
    // and useSession hooks returns the cached version of session, though user gets logged out.
    // so we need to refresh the page and take user to login screen
    //TODO: its a workarounnd but later may find some other solution
    await signOut({ callbackUrl: `${urls.login}` });
  };

  if (isUserAuthenticated) {
    // if user dont have workspace, means he has signed up but not created workspace, so redirect him to create workspace page
    if (!sessionData.user.workspaceId && !router.pathname.includes(`${urls.start}`)) {
      router.push(`${urls.start}`);
      return <div>Loading...</div>;
    }

    if (!sessionData.user.active) {
      return (
        <div className="text-center mt-3">
          <h4>
            Your user account is Inactive so You Cannot use System. Please Conatct Your Admin or Manager regarding this.
          </h4>
          <div className="mt-3">
            <h5> OR</h5>
            <TkButton className="mt-3" onClick={signOutHandler}>
              Log Out
            </TkButton>
          </div>
        </div>
      );
    }

    // hard coaded it here, as currentkly there is only one page where we have auth but no role is there for user,
    // if you wnat you can add a option in component options like norole, like we have added auth and layout
    if (!router.pathname.includes(`${urls.start}`)) {
      if (!sessionData.user.role) {
        return (
          <div className="text-center mt-3">
            <h4>
              You dont have a role, so You Cannot use System. Please Conatct Your Admin or Manager regarding this.
            </h4>
            <div className="mt-3">
              <h5> OR</h5>
              <TkButton className="mt-3" onClick={signOutHandler}>
                Log Out
              </TkButton>
            </div>
          </div>
        );
      }
      if (!sessionData.user.role.active) {
        return (
          <div className="text-center mt-3">
            <h4>
              Your Role is inactive so You Cannot use System. Please Conatct Your Admin or Manager regarding this.
            </h4>
            <div className="mt-3 ">
              <h5> OR</h5>
              <TkButton className="mt-3" onClick={signOutHandler}>
                Log Out
              </TkButton>
            </div>
          </div>
        );
      }
    }
    return <AuthContext.Provider value={sessionData}>{children}</AuthContext.Provider>;
  }
  return <AuthenticateUser>{children}</AuthenticateUser>;
}

function AuthWrap({ children, wrap }) {
  if (wrap) {
    return <Auth>{children}</Auth>;
  }
  return children;
}

function LayoutWrap({ children, wrap }) {
  if (wrap) {
    return <Layout>{children}</Layout>;
  }
  return children;
}

// TODO: truncate the text where required ( text-overflow: ellipsis;)
// TODO: prepare a error screen when our app is unavailable or down
