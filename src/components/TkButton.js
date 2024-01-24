import { Button, ButtonGroup, Spinner } from "reactstrap";
import PropTypes from "prop-types";
import classNames from "classnames";

export default function TkButton({
  onClick,
  className,
  color,
  type,
  disabled,
  loading,
  loadingText,
  name,
  innerRef,
  children,
  ...other
}) {
  return (
    <Button
      onClick={onClick}
      className={classNames(className, {
        "custom-secondary-button": color === "secondary",
      })}
      type={type}
      color={color}
      disabled={disabled || loading}
      name={name}
      innerRef={innerRef}
      {...other}
    >
      {loading ? (
        <>
          {/* the below loading text will not be shown becuase it is hidden and only for screen readers */}
          <Spinner size="sm">Loading...</Spinner>
          <span className="ps-1"> {loadingText ? loadingText : children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function TkButtonGroup({ vertical, children, ...other }) {
  return (
    <ButtonGroup vertical={vertical} {...other}>
      {children}
    </ButtonGroup>
  );
}

TkButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  name: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.string]),
  children: PropTypes.node,
};

TkButtonGroup.propTypes = {
  vertical: PropTypes.bool,
  children: PropTypes.node,
};
