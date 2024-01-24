import React from 'react';
import { Col, Container, Row } from 'reactstrap';

import TkRow,{TkCol} from '../../TkRow';
import TkContainer from '../../TkContainer';

const Footer = () => {
    return (
        <>
            <footer className="footer">
                <TkContainer fluid>
                    <TkRow>
                        <TkCol sm={6}>
                            {new Date().getFullYear()} © {process.env.NEXT_PUBLIC_APP_NAME}.
                        </TkCol>
                        <TkCol sm={6}>
                            <div className="text-sm-end d-none d-sm-block">
                                Designed & Developed by {process.env.NEXT_PUBLIC_COMP_NAME}
                            </div>
                        </TkCol>
                    </TkRow>
                </TkContainer>
            </footer>
        </>
    );
};

export default Footer;