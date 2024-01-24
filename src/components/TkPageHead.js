import Head from "next/head";
import PropTypes from "prop-types";

function TkPageHead({ children }) {
  return (
    <Head>
      {children}
    </Head>
  );
}

TkPageHead.propTypes = {
  children: PropTypes.node,
};

export default TkPageHead;
