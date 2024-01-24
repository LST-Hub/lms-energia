import { forwardRef } from "react";
import { Form, FormFeedback, FormText } from "reactstrap";
import Proptypes from "prop-types";

const TkForm = forwardRef(function TkForm(
  { className, onSubmit, innerRef, children, ...other },
  ref
) {
  return (
    <Form className={className} innerRef={ref} onSubmit={onSubmit} {...other}>
      {children}
    </Form>
  );
});

export function TkFormFeedback({ className, valid, tooltip, children, ...other }) {
  console.log("TkFormFeedback", className, valid, tooltip, children, other);
  return (
    <FormFeedback className={className} valid={valid} tooltip={tooltip} {...other}>
      {children}
    </FormFeedback>
  );
}

export function TkFormText({ className, color, children, ...other }) {
  return (
    <FormText color={color} className={className} {...other}>
      {children}
    </FormText>
  );
}

TkForm.propTypes = {
  className: Proptypes.string,
  onSubmit: Proptypes.func,
  innerRef: Proptypes.oneOfType([Proptypes.func, Proptypes.object, Proptypes.string]),
  children: Proptypes.oneOfType([Proptypes.arrayOf(Proptypes.node), Proptypes.node]),
};

TkFormFeedback.propTypes = {
  className: Proptypes.string,
  valid: Proptypes.bool,
  tooltip: Proptypes.bool,
  children: Proptypes.oneOfType([Proptypes.arrayOf(Proptypes.node), Proptypes.node]),
};

TkFormText.propTypes = {
  className: Proptypes.string,
  color: Proptypes.string,
  children: Proptypes.oneOfType([Proptypes.arrayOf(Proptypes.node), Proptypes.node]),
};

export default TkForm;
