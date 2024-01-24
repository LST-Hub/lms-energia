import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown, } from "reactstrap";

export function TkDropdown({ className, children, ...other }) {
    return (
        <Dropdown className={className} {...other}>
            {children}
        </Dropdown>
    );
}

export function TkDropdownItem({ className, children, ...other }) {
    return (
        <DropdownItem className={className} {...other}>
            {children}
        </DropdownItem>
    );
}

export function TkDropdownMenu({ className, children, ...other }) {
    return (
        <DropdownMenu className={className} {...other}>
            {children}
        </DropdownMenu>
    );
}

export function TkDropdownToggle({ className, children, ...other }) {
    return (
        <DropdownToggle className={className} {...other}>
            {children}
        </DropdownToggle>
    );
}

export function TkUncontrolledDropdown({ className, children, ...other }) {
    return (
        <UncontrolledDropdown className={className} {...other}>
            {children}
        </UncontrolledDropdown>
    );
}

