import React from 'react';
// import { crmWidgets } from "../../common/data";
import CountUp from "react-countup";

const crmWidgets = [
    {
        id: 1,
        label: "Campaign Sent",
        badge: "ri-arrow-up-circle-line text-success",
        icon: "ri-space-ship-line",
        counter: "197",
        decimals: 0,
        suffix: "",
        prefix: ""
    },
    {
        id: 2,
        label: "Annual Profit",
        badge: "ri-arrow-up-circle-line text-success",
        icon: "ri-exchange-dollar-line",
        counter: "489.4",
        decimals: 1,
        suffix: "k",
        prefix: "$"
    },
    {
        id: 3,
        label: "Lead Coversation",
        badge: "ri-arrow-down-circle-line text-danger",
        icon: "ri-pulse-line",
        counter: "32.89",
        decimals: 2,
        suffix: "%",
        prefix: ""
    },
    {
        id: 4,
        label: "Daily Average Income",
        badge: "ri-arrow-up-circle-line text-success",
        icon: "ri-trophy-line",
        counter: "1596.5",
        decimals: 1,
        prefix: "$",
        separator: ",",
        suffix: ""
    },
    {
        id: 5,
        label: "Annual Deals",
        badge: "ri-arrow-down-circle-line text-danger",
        icon: "ri-service-line",
        counter: "2659",
        decimals: 0,
        separator: ",",
        suffix: "",
        prefix: ""
    },
];

const Widget = () => {
    return (
        <React.Fragment>
            <div className="col-xl-12">
                <div className="card crm-widget">
                    <div className="card-body p-0">
                        <div className="row row-cols-xxl-5 row-cols-md-3 row-cols-1 g-0">
                            {(crmWidgets).map((widget, index) => (
                                <div className="col" key={index}>
                                    <div className="py-4 px-3">
                                        <h5 className="text-muted text-uppercase fs-13">{widget.label}<i className={widget.badge + " fs-18 float-end align-middle"}></i></h5>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <i className={widget.icon + " display-6 text-muted"}></i>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h2 className="mb-0"><span className="counter-value" data-target="197">
                                                    <CountUp
                                                        start={0}
                                                        prefix={widget.prefix}
                                                        suffix={widget.suffix}
                                                        separator={widget.separator}
                                                        end={widget.counter}
                                                        decimals={widget.decimals}
                                                        duration={4}
                                                    />
                                                </span></h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Widget;