import { FormFeedback } from "reactstrap";
import Proptypes from "prop-types";

function TkFormFeedback({ className, children, ...other }) {
    return (
        <FormFeedback className={className} {...other}>
            {children}
        </FormFeedback>
    );
}

TkFormFeedback.propTypes = {
    className: Proptypes.string,
    children: Proptypes.node,
};

export default TkFormFeedback;