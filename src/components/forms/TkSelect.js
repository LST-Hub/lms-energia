import { forwardRef } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { Label } from "reactstrap";

const TkSelect = forwardRef(function TkSelect(
  {
    id,
    name,
    value,
    onChange,
    isMulti,
    labelName,
    className,
    labelClassName,
    disabled,
    loading,
    options,
    innerRef,
    isClearable,
    requiredStarOnLabel,
    styles,
    ...props
  },
  ref
) {
  return (
    <>
      {/* id is required for creating label , because it is needed for screen readers */}
      {labelName && id ? (
        <Label htmlFor={id} className={labelClassName}>
          {labelName}
          {requiredStarOnLabel ? <span className="text-danger"> *</span> : null}
        </Label>
      ) : null}
      <Select
        id={id}
        name={name}
        value={value}
        classNamePrefix={"react-select"}
        className={className}
        onChange={onChange}
        ref={ref}
        isMulti={isMulti}
        isClearable={isClearable}
        options={options}
        styles={styles ? { ...styles, border: "2px solid #0093FF" } : { border: "2px solid #0093FF" }}
        isLoading={loading}
        isDisabled={disabled}
        {...props}
      />
    </>
  );
});

TkSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string,
  isMulti: PropTypes.bool,
  options: PropTypes.array.isRequired,
  styles: PropTypes.object,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  // innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  disabled: PropTypes.bool,
  isClearable: PropTypes.bool,
};

TkSelect.defaultProps = {
  isClearable: true,
};

export default TkSelect;
