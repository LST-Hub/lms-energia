import { Label } from "reactstrap";
import PropTypes from "prop-types";
import { Children } from "react";

function TkLabel({ id, className, requiredStarOnLabel, children, ...rest }) {
  return (
    <>
      <Label htmlFor={id} className={className} {...rest}>
        {children} {requiredStarOnLabel ? <span className="text-danger"> *</span> : null}
      </Label>
    </>
  );
}

TkLabel.propTypes = {
  requiredStarOnLabel: PropTypes.bool,
};

// TkLabel.defaultProps = {
// reactstrap adds fform-label class to label tag so no need to add it
// className: "form-label",
// };

export default TkLabel;
