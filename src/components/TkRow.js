import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
export default function TkRow({ className, noGutters, xs, sm, md, lg, xl, xxl, children, ...other }) {
  return (
    <Row className={className} xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl} noGutters={noGutters} {...other}>
      {children}
    </Row>
  );
}

TkRow.propTypes = {
  className: PropTypes.string,
  noGutters: PropTypes.bool,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  xxl: PropTypes.number,
  children: PropTypes.node,
};

export function TkCol({ className, xs, sm, md, lg, xl, xxl, children, ...other }) {
  return (
    <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl} className={className} {...other}>
      {children}
    </Col>
  );
}

TkCol.propTypes = {
  className: PropTypes.string,
  xs: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.bool]), // keeping string as xs can accept "auto" as well
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  xxl: PropTypes.number,
  children: PropTypes.node,
};
