import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardGroup,
  CardText,
  CardImg,
  CardLink,
  CardTitle,
  CardSubtitle,
  CardImgOverlay,
} from "reactstrap";

export default function TkCard({ className, color, innerRef, outline, children, ...other }) {
  return (
    <Card color={color} outline={outline} innerRef={innerRef} className={className} {...other}>
      {children}
    </Card>
  );
}

export function TkCardBody({ className, innerRef, children, ...other }) {
  return (
    <CardBody className={className} innerRef={innerRef} {...other}>
      {children}
    </CardBody>
  );
}

export function TkCardHeader({ className, children, ...other }) {
  return (
    <CardHeader className={className} {...other}>
      {children}
    </CardHeader>
  );
}

export function TkCardFooter({ className, children, ...other }) {
  return (
    <CardFooter className={className} {...other}>
      {children}
    </CardFooter>
  );
}

export function TkCardGroup({ className, children, ...other }) {
  return (
    <CardGroup className={className} {...other}>
      {children}
    </CardGroup>
  );
}

export function TkCardText({ className, children, ...other }) {
  return (
    <CardText className={className} {...other}>
      {children}
    </CardText>
  );
}

export function TkCardImg({ className, src, alt, top, bottom, ...other }) {
  return <CardImg className={className} src={src} alt={alt} top={top} bottom={bottom} {...other} />;
}

export function TkCardLink({ className, href, innerRef, children, ...other }) {
  return (
    <CardLink className={className} innerRef={innerRef} href={href} {...other}>
      {children}
    </CardLink>
  );
}

export function TkCardTitle({ className, children, ...other }) {
  return (
    <CardTitle className={className} {...other}>
      {children}
    </CardTitle>
  );
}

export function TkCardSubtitle({ className, children, ...other }) {
  return (
    <CardSubtitle className={className} {...other}>
      {children}
    </CardSubtitle>
  );
}

export function TkCardImgOverlay({ className, children, ...other }) {
  return (
    <CardImgOverlay className={className} {...other}>
      {children}
    </CardImgOverlay>
  );
}
