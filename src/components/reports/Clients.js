import React, { useState, useEffect, useMemo, useReducer } from "react";
import "react-toastify/dist/ReactToastify.css";
import TkIcon from "../TkIcon";
import TkRow, { TkCol } from "../TkRow";
import { TkCardHeader, TkCardBody, TkCardTitle } from "../TkCard";
import TkTableContainer from "../TkTableContainer";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, filterFields, searchParamName } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import TkSelect from "../forms/TkSelect";
import { convertToURLParamsString, isSearchonUI, searchAndFilterData } from "../../utils/utilsFunctions";
import TkButton from "../TkButton";
import { CSVLink } from "react-csv";
import { convertSecToTime } from "../../utils/time";
import { UncontrolledTooltip } from "reactstrap";

const headers = [
  { label: "Client Name", key: "clientName" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Active", key: "active" },
  { label: "Actual Time", key: "actualTime" },
];

function TableToolBar({ onClientChange, totalHrs }) {
  const [allClients, setAllClients] = useState([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allClientList],
    queryFn: tkFetch.get(`${API_BASE_URL}/client/list?indexFilter=true`),
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const p = data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setAllClients(p);
    }
  }, [data]);

  return (
    <>
      <TkCardBody className="table-toolbar mt-3 mb-3">
        <TkRow className="mb-3">
          <TkCol lg={3} className="mt-1">
            <h4>Total Hrs: {totalHrs}</h4>
          </TkCol>
          <TkCol lg={3}>
            <TkSelect placeholder="Select Client" loading={isLoading} options={allClients} onChange={onClientChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const ReportsClients = () => {
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.clientReport.client]: null,
  });

  const [client, setClient] = useState([]);
  const [clientBackendData, setClientBackendData] = useState([]); // this is used to store the backend data when we apply filters [not used now
  const [urlParamsStr, setUrlParamsStr] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [totalHrs, setTotalHrs] = useState(0);

  const addActualTime = (data, clientsTime) => {
    const newData = data?.map((client) => {
      const clientTime = clientsTime?.find((c) => c.id === client.id);
      return {
        ...client,
        actualTime: clientTime?.totalDuration || null,
      };
    });
    return newData;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allClients],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/client`),
    // enabled: Number(accessLevel) >= perAccessIds.view,
  });

  const {
    data: clientsTime,
    isLoading: actualTimeLoading,
    isError: actualTimeError,
    error: actualTimeErr,
  } = useQuery({
    queryKey: [RQ.allClientsActualTime],
    queryFn: tkFetch.get(`${API_BASE_URL}/client/actual-time`),
  });

  const {
    data: backData,
    isLoading: backIsLoading,
    isError: backIsError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allProjects, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/reports/client${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: !!urlParamsStr,
  });

  useEffect(() => {
    if (data && clientsTime) {
      const newData = addActualTime(data, clientsTime);
      setClient(newData);
    }
  }, [data, clientsTime]);

  useEffect(() => {
    if (backData && clientsTime) {
      const newData = addActualTime(backData, clientsTime);
      setClientBackendData(newData);
    }
  }, [backData, clientsTime]);

  useEffect(() => {
    let doFilter = true;
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }
    if (!doFilter) {
      // if data is undefined then set it to empty array
      const newData = addActualTime(data, clientsTime);
      setClient(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, null, null, filters);
      const newDataWithActualTime = addActualTime(newData, clientsTime);
      setClient(newDataWithActualTime);
    } else {
      const urlParamString = convertToURLParamsString({ [searchParamName]: null, ...filters });
      setUrlParamsStr(urlParamString);
    }
  }, [filters, data, clientsTime]);

  const backendData = urlParamsStr.length > 0 ? clientBackendData : null;

  const columns = useMemo(
    () => [
      {
        Header: "Client Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value.length > 13 ? (
                <>
                  <span id={`client${cellProps.row.index}`}>
                    {cellProps.value.substring(0, 13) + "..."}
                  </span>
                  <UncontrolledTooltip
                    target={`client${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
            </div>
          );
        },
      },

      {
        Header: "Email",
        accessor: "email",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" ? <div> — </div> : <div>{cellProps.value}</div>;
        },
      },

      {
        Header: "Phone",
        accessor: "phone",
        filterable: false,
        Cell: (cellProps) => {
          return cellProps.value === "" ? <div> — </div>  : <div>{cellProps.value}</div>;
        },
      },
      {
        Header: "Active",
        accessor: "active",
        filterable: false,
        Cell: (cellProps) => {
          return <div>{cellProps.value.toString()}</div>;
        },
      },
      {
        Header: "Actual Time",
        accessor: "actualTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>{cellProps.value === null ? <span> — </span>  : <span>{convertSecToTime(cellProps.value)}</span>}</div>
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (data?.length > 0) {
      if (client?.length > 0) {
        const exportData = client.map((item) => {
          return {
            clientName: item.name,
            email: item.email,
            phone: item.phone,
            active: item.active,
            actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
          };
        });
        setCsvData(exportData);
      }
      if (backData?.length > 0) {
        const exportData = backData.map((item) => {
          return {
            clientName: item.name,
            email: item.email,
            phone: item.phone,
            active: item.active,
            actualTime: item.actualTime === null ? "NA" : convertSecToTime(item.actualTime),
          };
        });
        setCsvData(exportData);
      }
    }
  }, [client, data, backData]);

  useEffect(() => {
    if (backendData?.length === 0) {
      setTotalHrs(0);
      return;
    }
    if (backendData?.length > 0) {
      const totalHrs = backendData.reduce((acc, item) => {
        return acc + item.actualTime;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else if (client?.length > 0) {
      const totalHrs = client.reduce((acc, item) => {
        return acc + item.actualTime;
      }, 0);
      setTotalHrs(convertSecToTime(totalHrs));
    } else {
      setTotalHrs(0);
    }
  }, [client, backendData]);

  return (
    <>
      <TkRow>
        <TkCol lg={12}>
          {/* <TkCard id="tasksList"> */}
          <TkCardHeader className="tk-card-header">
            <div className="d-flex align-items-center">
              {/* <TkCardTitle tag="h5" className=" mb-0 flex-grow-1">Clients</TkCardTitle> */}
              <TkCardTitle className="mb-0 flex-grow-1">
                <h3>Clients</h3>{" "}
              </TkCardTitle>
              <div className="d-flex flex-shrink-0">
                <CSVLink data={csvData} filename={"Clients.csv"} headers={headers} className={`btn btn-primary add-btn text-white ${client.length === 0 || isLoading ? 'disabled' : ''}`}>
                  {/* <TkButton disabled={client.length === 0 || isLoading} className="btn btn-primary add-btn me-1"> */}
                    <TkIcon className="ri-download-2-line align-bottom me-1"></TkIcon> Export
                  {/* </TkButton> */}
                </CSVLink>
              </div>
            </div>
          </TkCardHeader>
          <TkCardBody className="pt-0">
            <TkTableContainer
              columns={columns}
              data={backendData || client}
              Toolbar={
                <TableToolBar
                  onClientChange={(item) => {
                    updateFilters({
                      [filterFields.clientReport.client]: item ? item.value : null,
                    });
                  }}
                  totalHrs={totalHrs}
                />
              }
              isSearch={true}
              defaultPageSize={10}
              customPageSize={true}
              showPagination={true}
              isFilters={true}
              loading={urlParamsStr.length > 0 && backIsLoading}
            />

            {/* <ToastContainer closeButton={false} /> */}
          </TkCardBody>
          {/* </TkCard> */}
        </TkCol>
      </TkRow>
    </>
  );
};

export default ReportsClients;
