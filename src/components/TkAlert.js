import { Alert } from "reactstrap";
import Proptypes from "prop-types";

function TkAlert({ className, children, color, isOpen, toggle, ...other }) {
  return (
      <Alert className={className} color={color} isOpen={isOpen} toggle={toggle} {...other}>
      {children}
    </Alert>
  );
}

TkAlert.propTypes = {
    className: Proptypes.string,
    children: Proptypes.node,
    color: Proptypes.string,
    isOpen: Proptypes.bool,
    toggle: Proptypes.func,
};

export default TkAlert;
