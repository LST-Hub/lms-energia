import React, { forwardRef } from "react";
import PropTypes from "prop-types";

const ToggleSwitch = forwardRef(function TkToggle({ id, name, checked, onChange, optionLabels, small, disabled }, ref) {
  return (
    <div className={"toggle-switch" + (small ? " small-switch" : "")}>
      <input
        type="checkbox"
        name={name}
        className="toggle-switch-checkbox"
        id={id}
        checked={checked}
        ref={ref}
        onChange={onChange}
        disabled={disabled}
      />
      {id ? (
        <label className="toggle-switch-label" tabIndex={disabled ? -1 : 1} htmlFor={id}>
          <span
            className={disabled ? "toggle-switch-inner toggle-switch-disabled" : "toggle-switch-inner"}
            data-yes={optionLabels[0]}
            data-no={optionLabels[1]}
            tabIndex={-1}
          />
          <span
            className={disabled ? "toggle-switch-switch toggle-switch-disabled" : "toggle-switch-switch"}
            tabIndex={-1}
          />
        </label>
      ) : null}
    </div>
  );
});

// Set optionLabels for rendering.
ToggleSwitch.defaultProps = {
  optionLabels: ["Yes", "No"],
};

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  name: PropTypes.string,
  optionLabels: PropTypes.array,
  small: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ToggleSwitch;
