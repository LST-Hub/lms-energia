import { forwardRef } from "react";
import TkInput from "./forms/TkInput";
import PropTypes from "prop-types";
import { useState } from "react";
import { convertToTime } from "../utils/time";

const TkReactTableInput = forwardRef(function Cell(
  {
    type,
    name,
    labelName,
    id,
    disabled,
    placeholder,
    value: initialValue,
    onChange,
    onBlur,
    requiredStarOnLabel,
    updateValue, // This is a custom function that we supplied to our table instance
  },
  ref
) {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);
  const onInternalChange = (e) => {
    setValue(e.target.value);
    onChange(e);
  };
  // We'll only update the external data when the input is blurred
  const onInternalBlur = (e) => {
    updateValue(e.target.value);
    onBlur(e);
    setValue(e.target.value);
  };
  return (
    <>
      <TkInput
        labelName={labelName}
        placeholder={placeholder}
        id={id}
        ref={ref}
        name={name}
        type={type}
        disabled={disabled}
        value={value}
        onChange={onInternalChange}
        onBlur={onInternalBlur}
        requiredStarOnLabel={requiredStarOnLabel}
      />
    </>
  );
});

TkReactTableInput.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  labelName: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export default TkReactTableInput;
