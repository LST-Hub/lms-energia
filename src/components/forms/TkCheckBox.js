import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Input } from "reactstrap";

const TkCheckBox = forwardRef(function TkCheckBox(
  { onChange, className, color, id, name, disabled, checked, defaultChecked, children, ...other },
  ref
) {
  return (
    <Input
      onChange={onChange}
      id={id}
      name={name}
      type="checkbox"
      className={className}
      color={color}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      innerRef={ref}
      {...other}
    >
      {children}
    </Input>
  );
});

TkCheckBox.propTypes = {
  onChange: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  defaultChecked: PropTypes.bool,
  checked: PropTypes.bool,
};

export default TkCheckBox;
