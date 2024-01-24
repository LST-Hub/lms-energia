import classNames from "classnames";

function FormErrorText({ className, children, errMessage, ...other }) {
  return (
    <>
      {/* see globalcss for styling */}
      <div className={classNames("d-flex justify-content-start align-items-center mt-1", className)} {...other}>
        <i className="ri-error-warning-fill form-error-icon"></i>
        <p className="mb-0 form-error-text">{errMessage ? errMessage : children}</p>
      </div>
    </>
  );
}

export default FormErrorText;

export function FormErrorBox({ className, errMessage, children, ...other }) {
  return (
    <>
      <div
        className={classNames("form-error-box alert alert-danger bg-white fade show mt-3", className)}
        role="alert"
        {...other}
      >
        <div className="d-flex align-items-center">
          <i className="ri-error-warning-fill form-error-icon "></i>
          <h6 className="text-red mb-0">{errMessage ? errMessage : children}</h6>
        </div>
      </div>
    </>
  );
}
