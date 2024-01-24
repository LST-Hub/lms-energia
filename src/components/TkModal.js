import { Modal, ModalHeader, ModalBody,ModalFooter } from "reactstrap";

export default function TkModal({ className, innerRef, isOpen, centered, children, size, modalClassName, toggle, ...other }) {
    return (
        <Modal className={className} innerRef={innerRef} isOpen={isOpen} centered={centered} toggle={toggle} size={size} modalClassName={modalClassName} {...other}>
            {children}
        </Modal>
    );
}

export function TkModalHeader({ className, toggle, children, ...other }) {
    return (
        <ModalHeader className={className} toggle={toggle} {...other}>
            {children}
        </ModalHeader>
    );
}

export function TkModalBody({ className, children, ...other }) {
    return (
        <ModalBody className={className} {...other}>
            {children}
        </ModalBody>
    );
}

export function TkModalFooter({ className, children, ...other }) {
    return (
        <ModalFooter className={className} {...other}>
            {children}
        </ModalFooter>
    );
}
