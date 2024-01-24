import React from 'react';
import { projectsWidgets } from '../../test-data/dashboard';
import CountUp from "react-countup";

//Import Icons
import FeatherIcon from "feather-icons-react";

import TkCard,{TkCardBody} from '../TkCard';
import TkRow, { TkCol } from '../TkRow';
import TkIcon from '../TkIcon';
import { useQuery } from '@tanstack/react-query';
import tkFetch from '../../utils/fetch';
import { API_BASE_URL, RQ } from '../../utils/Constants';

const Widgets = () => {

    // const { data, isLoading, isError, error } = useQuery({
    //     queryKey: [RQ.allProjects],
    //     queryFn: tkFetch.get(`${API_BASE_URL}/dashboard/projectCount`),
    //   });

    //   console.log(data);

    return (
        <>
            <TkRow>
            {/* TODO: fetch data for widgets asynchronously from API */}
                {(projectsWidgets || []).map((item, key) => (
                    <TkCol md={6} xl={4} key={key}>
                        <TkCard className="card-animate">
                            <TkCardBody>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className={`avatar-title bg-soft-${item.feaIconClass} text-${item.feaIconClass} rounded-2 fs-2`}>
                                            <FeatherIcon icon={item.feaIcon} className={`text-${item.feaIconClass}`} />
                                        </span>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden ms-3">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-3">{item.label}</p>
                                        <div className="d-flex align-items-center mb-3">
                                            <h4 className="fs-4 flex-grow-1 mb-0">
                                                {item.subCounter.map((item,key)=>(<span className="counter-value me-1" data-target="825" key={key}>
                                                    <CountUp
                                                        start={0}
                                                        suffix={item.suffix}
                                                        separator={item.separator}
                                                        end={item.counter}
                                                        duration={4}
                                                    />
                                                </span>))}
                                            </h4>
                                            <span className={"fs-12 badge badge-soft-" + item.badgeClass}><TkIcon className={"fs-13 align-middle me-1 " + item.icon}></TkIcon>{item.percentage}</span>
                                        </div>
                                        <p className="text-muted text-truncate mb-0">{item.caption}</p>
                                    </div>
                                </div>
                            </TkCardBody>
                        </TkCard>
                    </TkCol>
                ))}
            </TkRow>
        </>
    );
};

export default Widgets;