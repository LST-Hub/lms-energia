// import classNames from "classnames";
// import Flatpickr from "react-flatpickr";
// import PropTypes from "prop-types";
// import { Label } from "reactstrap";
// import { forwardRef, useRef } from "react";

// const TkDate = forwardRef(function Date(
//   { name, id, labelName, labelClassName, requiredStarOnLabel, placeholder, innerRef, className, children, ...other },
//   ref
// ) {
//   const fref = useRef();
//   return (
//     <>
//       {labelName && id ? (
//         <Label htmlFor={id} className={labelClassName}>
//           {labelName}
//           {requiredStarOnLabel ? <span className="text-danger"> *</span> : null}
//         </Label>
//       ) : null}
//       <Flatpickr
//         name={name}
//         id={id}
//         placeholder={placeholder}
//         // ref={ref || innerRef} // kept innerRef for backward compatibility
//         // we are not defining value ,onchange ,onopen or other functons as passing undef to them id raising the error , unlike other react components
//         // value={value} // value is required
//         // onChange={onChange} // onChange is required
//         className={classNames(className, "form-control", "tk-date-select-field")}
//         {...other}
//       />
//     </>
//   );
// });

// TkDate.propTypes = {
//   className: PropTypes.string,
//   // options: PropTypes.object,
//   // onChange: PropTypes.func.isRequired,
//   // value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
//   placeholder: PropTypes.string,
//   innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
//   name: PropTypes.string,
//   id: PropTypes.string,
// };

// export default TkDate;

import classNames from "classnames";
import Flatpickr from "react-flatpickr";
import PropTypes from "prop-types";
import { Label } from "reactstrap";
import { forwardRef, useRef } from "react";

const TkDate = forwardRef(function Date(
  {
    name,
    id,
    labelName,
    labelClassName,
    requiredStarOnLabel,
    placeholder,
    innerRef,
    className,
    onChange,
    children,
    ...other
  },
  ref
) {
  // return null if no date is selected, return the dates if only 1 date is selectd, or return array of dates if multiple dates are selected
  const adjustDateArr = (dates) => {
    if (typeof onChange === "function") {
      if (Array.isArray(dates)) {
        if (dates.length === 0) {
          onChange(null);
          return;
        }
        if (dates.length === 1) {
          onChange(dates[0]);
          return;
        }
      }
      onChange(dates);
    }
  };
  return (
    <>
      {labelName && id ? (
        <Label htmlFor={id} className={labelClassName}>
          {labelName}
          {requiredStarOnLabel ? <span className="text-danger"> *</span> : null}
        </Label>
      ) : null}
      <Flatpickr
        name={name}
        id={id}
        placeholder={placeholder}
        // ref={ref || innerRef} // kept innerRef for backward compatibility
        // we are not defining value ,onchange ,onopen or other functons as passing undef to them id raising the error , unlike other react components
        // value={value} // value is required
        onChange={adjustDateArr}
        className={classNames(className, "form-control", "tk-date-select-field")}
        {...other}
      />
    </>
  );
});

TkDate.propTypes = {
  className: PropTypes.string,
  // options: PropTypes.object,
  onChange: PropTypes.func,
  // value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
  placeholder: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  name: PropTypes.string,
  id: PropTypes.string,
};

export default TkDate;
