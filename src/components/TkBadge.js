import { Badge } from "reactstrap";
import ProptTypes from "prop-types";

function TkBadge({ className,innerRef, color, pill, children, ...other }) {
  return (
    <Badge color={color} pill={pill} innerRef={innerRef} className={className} {...other}>
      {children}
    </Badge>
  );
}

TkBadge.propTypes = {
  className: ProptTypes.string,
  color: ProptTypes.string,
  pill: ProptTypes.bool,
  innerRef: ProptTypes.oneOfType([ProptTypes.func, ProptTypes.object, ProptTypes.string]),
  children: ProptTypes.node,
};

export default TkBadge;
