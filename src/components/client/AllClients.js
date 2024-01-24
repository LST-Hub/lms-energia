import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TkInput from "../forms/TkInput";
import TkRow, { TkCol } from "../TkRow";
import TkForm from "../forms/TkForm";
import TkButton from "../TkButton";
import TkIcon from "../TkIcon";
import { TkCardBody, TkCardHeader, TkCardTitle } from "../TkCard";
import TkModal, { TkModalBody, TkModalHeader } from "../TkModal";
import TkTableContainer from "../TkTableContainer";
import { TkToastSuccess } from "../TkToastContainer";
import TkLoader from "../TkLoader";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import {
  MaxEmailLength,
  MaxPhoneNumberLength,
  bigInpuMaxLength,
  API_BASE_URL,
  RQ,
  serachFields,
  filterFields,
  searchParamName,
  minSearchLength,
  filterStatusOptions,
  smallInputMaxLength,
  smallInputMinLength,
  urls,
} from "../../utils/Constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import TkNoData from "../TkNoData";
import TkAccessDenied from "../TkAccessDenied";
import {
  convertToURLParamsString,
  isSearchonUI,
  searchAndFilterData,
  searchDebounce,
} from "../../utils/utilsFunctions";
import TkSelect from "../forms/TkSelect";
import { useReducer } from "react";
import { formatDate } from "../../utils/date";
import { convertSecToTime } from "../../utils/time";
import { UncontrolledTooltip } from "reactstrap";

function TableToolBar({ onSearchChange, onActiveChange }) {
  return (
    <>
      <TkCardBody className="table-toolbar mt-3">
        <TkRow className="mb-3">
          <TkCol lg={3}>
            <TkInput onChange={onSearchChange} placeholder="Search Client" isSearchField={true} />
          </TkCol>
          <TkCol lg={3}>
            <TkSelect placeholder="Active/Inactive" options={filterStatusOptions} onChange={onActiveChange} />
          </TkCol>
        </TkRow>
      </TkCardBody>
    </>
  );
}

const schema = Yup.object({
  clientEmail: Yup.string()
    .email("Email must be valid.")
    .max(MaxEmailLength, `Email must be at most ${MaxEmailLength} characters.`),

  clientName: Yup.string()
    .min(smallInputMinLength, `Client name must be at least ${smallInputMinLength} character.`)
    .max(smallInputMaxLength, `Client name must be at most ${smallInputMaxLength} characters.`)
    .required("Client name is required"),

  //TODO: need to check why is validation error is showing if there is no value in field

  phoneNumber: Yup.string()
    // .matches(/^[0-9]*$/, "Phone number must be number.")
    // phone number accept number and symbols like +, -, (, )
    .matches(/^[0-9+() -]*$/, "Phone number must be number.")
    .max(MaxPhoneNumberLength, `Phone number must be at most   ${MaxPhoneNumberLength} numbers.`)
    .nullable(),

  notes: Yup.string().nullable().max(bigInpuMaxLength, `Notes must be at most ${bigInpuMaxLength} characters.`),
}).required();

const AllClients = ({ modal, setModal, toggle, perAccessIds, accessLevel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

  const [clientsData, setClientsData] = useState([]);
  const [clientBackendData, setClientBackendData] = useState([]); // this is used to store the backend data when we apply filters [not used now
  const [urlParamsStr, setUrlParamsStr] = React.useState("");
  const [searchText, setSearchText] = useState("");
  const [filters, updateFilters] = useReducer((state, newState) => ({ ...state, ...newState }), {
    [filterFields.clients.active]: null, // keep the initial values to null for filters
  });

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allClients],
    queryFn: tkFetch.get(`${API_BASE_URL}/client`),
    enabled: Number(accessLevel) >= perAccessIds?.view,
  });
  const {
    data: backData,
    isLoading: isBackLoading,
    isError: isBackError,
    error: backError,
  } = useQuery({
    queryKey: [RQ.allClients, urlParamsStr],
    queryFn: tkFetch.get(`${API_BASE_URL}/client?${urlParamsStr ? `?${urlParamsStr}` : ""}`),
    enabled: Number(accessLevel) >= perAccessIds?.view && !!urlParamsStr,
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

  useEffect(() => {
    if (data && clientsTime) {
      const newData = addActualTime(data, clientsTime);
      setClientsData(newData);
    }
  }, [clientsTime, data]);
  useEffect(() => {
    if (backData && clientsTime) {
      const newData = addActualTime(backData, clientsTime);
      setClientBackendData(newData);
    }
  }, [backData, clientsTime]);

  const columns = useMemo(
    () => [
      // {
      //   Header: <input type="checkbox" id="checkBoxAll" className="form-check-input" onChange={() => checkedAll()} />,
      //   Cell: (cellProps) => {
      //     return (
      //       <input type="checkbox" className="clientCheckBox form-check-input" value={cellProps.row.original._id} />
      //     );
      //   },
      //   id: "#",
      // },
      // {
      //   Header: "Client ID",
      //   accessor: "id",
      //   filterable: false,
      //   Cell: (cellProps) => {
      //     return <OrdersId {...cellProps} />;
      //   },
      // },
      {
        Header: "View | Edit",
        accessor: "id",
        filterable: false,
        Cell: (cellProps) => {
          return (
            //   <div className="flex-grow-1 tasks_name">{cellProps.value}</div>
            <div className="d-flex align-items-center">
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.clientView}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-eye-fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul>
              |
              <ul className="ps-0 mb-0">
                <li className="list-inline-item">
                  <Link href={`${urls.clientEdit}/${cellProps.value}`}>
                    <a>
                      <TkButton color="none">
                        <TkIcon className="ri-edit-line fs-4 -fill align-bottom me-2 text-muted"></TkIcon>
                      </TkButton>
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          );
        },
      },
      {
        Header: "Client Name",
        accessor: "name",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Link href={`${urls.clientView}/${cellProps.row.original.id}`}>
                    <a className="fw-medium table-link text-primary">
                      <div className="flex-grow-1 tasks_name">
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
                    </a>
                  </Link>
                </div>
              </div>
            </>
          );
        },
      },
      {
        Header: "Created By",
        accessor: "createdBy.name",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">
            {cellProps.value?.length > 13 ? (
                <>
                  <span id={`createdBy${cellProps.row.index}`}>{cellProps.value.substring(0, 13) + "..."}</span>
                  <UncontrolledTooltip
                    target={`createdBy${cellProps.row.index}`}
                    className="custom-tooltip-style"
                    style={{ backgroundColor: "#dfe6eb", color: "#212529" }}
                  >
                    {cellProps.value}
                  </UncontrolledTooltip>
                </>
              ) : (
                cellProps.value
              )}
          </div>;
        },
      },
      {
        Header: "Created Date",
        accessor: "createdAt",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="table-text">{formatDate(cellProps.value)}</div>;
        },
      },
      {
        Header: "Actual Time",
        accessor: "actualTime",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>{cellProps.value === null ? <span> — </span> : <span>{convertSecToTime(cellProps.value)}</span>}</div>
          );
        },
      },
    ],
    []
  );

  const clientData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/client`),
  });

  const onCancel = () => {
    setValue("clientName", "");
    setValue("clientEmail", "");
    setValue("phoneNumber", null);
    setValue("notes", "");
    setModal(false);
  };

  const onSubmit = (formData) => {
    const apiData = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      phoneNumber: formData.phoneNumber,
      notes: formData.notes,
    };
    clientData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Client Added Successfully");
        setValue("clientName", "");
        setValue("clientEmail", "");
        setValue("phoneNumber", null);
        setValue("notes", "");
        setModal(false);
        // queryClient.setQueriesData(RQ.allClients, (old) => [...old, data]);
        queryClient.invalidateQueries({
          queryKey: [RQ.allClients],
        });
      },
      onError: (error) => {
        console.log("add client error", error);
        // TkToastError("Error occured while adding client");
      },
    });
    // setModal(false);
  };

  // useEffect(() => {
  //   if (data) {
  //     setClientsData(data);
  //   }
  // }, [data]);

  useEffect(() => {
    let doSearch = true;
    let doFilter = true;
    if (searchText === "") {
      doSearch = false;
    }
    if (Object.values(filters).every((val) => val === null || val === undefined || val === "")) {
      doFilter = false;
    }

    if (!doSearch && !doFilter) {
      const newData = addActualTime(data, clientsTime);
      setClientsData(newData || []);
      setUrlParamsStr("");
      return;
    }
    if (isSearchonUI(data)) {
      const newData = searchAndFilterData(data, searchText, serachFields.clients, filters);
      const newDataWithActualTime = addActualTime(newData, clientsTime);
      setClientsData(newDataWithActualTime);
    } else {
      const urlParamString = convertToURLParamsString({
        [searchParamName]: searchText,
        ...filters,
      });
      setUrlParamsStr(urlParamString);
    }
  }, [data, searchText, filters, clientsTime]);

  const searchonUI = isSearchonUI(data);
  const backendData = urlParamsStr.length > 0 ? backData : null;

  useEffect(() => {
    if (backendData) {
      setClientBackendData(backendData);
    }
  }, [backendData]);

  const updateSearchText = (e) => {
    if (e.target.value.length >= minSearchLength) {
      setSearchText(e.target.value);
    } else {
      setSearchText("");
    }
  };

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <React.Fragment>
      <TkRow>
        {isLoading ? (
          <TkLoader />
        ) : isError ? (
          <FormErrorBox errMessage={error.message} />
        ) : data.length > 0 ? (
          <>
            <TkCol lg={12}>
              {/* <TkCard id="clientList"> */}
              {/* <TkCardHeader className="tk-card-header">
                <div className="d-flex align-items-center">
                  <TkCardTitle tag="h3" className="mb-0 flex-grow-1">
                    <h3>All Clients</h3>
                  </TkCardTitle>
                </div>
              </TkCardHeader> */}
              <TkCardBody className="pt-0">
                {isBackError ? (
                  <FormErrorBox errMessage={backError.message} />
                ) : (
                  <TkTableContainer
                    columns={columns}
                    data={backendData || clientsData}
                    Toolbar={
                      <TableToolBar
                        onSearchChange={searchDebounce(updateSearchText, searchonUI)}
                        onActiveChange={(item) => {
                          updateFilters({
                            [filterFields.clients.active]: item ? item.value : null,
                          });
                        }}
                      />
                    }
                    defaultPageSize={10}
                    customPageSize={true}
                    // isFilters={false} // make it true to see filetrs
                    showPagination={true}
                    // rowSelection={true} // pass it true to enable row selection
                    loading={urlParamsStr.length > 0 && isBackLoading}
                    // onRowSelection={(rows) => {
                    //   // pass a use callback for this function as it will rerender the tabel in not usecallabck
                    //   //you will get all rows selected data here
                    // }}
                    showSelectedRowCount={true} // pass it true to show the selected row count
                  />
                )}
              </TkCardBody>
              {/* </TkCard> */}
            </TkCol>
          </>
        ) : (
          <TkCol lg={12}>
            <TkNoData />
          </TkCol>
        )}
      </TkRow>

      <TkModal
        isOpen={modal}
        toggle={toggle}
        centered
        size="lg"
        className="border-0"
        modalClassName="modal fade zoomIn"
      >
        <TkModalHeader className="p-3 bg-soft-info" toggle={toggle}>
          {"Create Client"}
        </TkModalHeader>
        <TkForm onSubmit={handleSubmit(onSubmit)}>
          <TkModalBody className="modal-body">
            <TkRow className="g-3">
              <TkCol lg={6}>
                <TkInput
                  {...register("clientName")}
                  id="clientName"
                  type="text"
                  labelName="Client Name"
                  // tooltip="Enter Client Name"
                  // labelId={"_clientName"}
                  placeholder="Enter Client Name"
                  requiredStarOnLabel={true}
                  invalid={errors.clientName?.message ? true : false}
                />
                {errors.clientName?.message ? <FormErrorText>{errors.clientName?.message}</FormErrorText> : null}
              </TkCol>

              {/* <TkCol lg={6}>
                <TkInput
                  id="clientId"
                  className="form-control"
                  type="text"
                  labelName="Client ID"
                  placeholder="Client ID"
                />
              </TkCol> */}

              <TkCol lg={6}>
                <TkInput
                  {...register("clientEmail")}
                  id="email"
                  type="email"
                  labelName="Email"
                  // tooltip="Enter Email"
                  // labelId={"_email"}
                  placeholder="Enter Email"
                  invalid={errors.clientEmail?.message ? true : false}
                />
                {errors.clientEmail?.message ? <FormErrorText>{errors.clientEmail?.message}</FormErrorText> : null}
              </TkCol>

              <TkCol lg={6}>
                <TkInput
                  {...register("phoneNumber")}
                  id="phone"
                  type="text"
                  labelName="Phone"
                  // tooltip="Enter Phone Number"
                  // labelId={"_phone"}
                  placeholder="Enter Phone Number"
                  invalid={errors.phoneNumber?.message ? true : false}
                />
                {errors.phoneNumber?.message ? <FormErrorText>{errors.phoneNumber?.message}</FormErrorText> : null}
              </TkCol>

              <TkCol lg={12}>
                <TkInput
                  {...register("notes")}
                  id="notes"
                  type="textarea"
                  labelName="Notes"
                  // tooltip="Enter Notes"
                  // labelId={"_notes"}
                  placeholder="Enter Notes"
                  invalid={errors.notes?.message ? true : false}
                />
                {errors.notes?.message ? <FormErrorText>{errors.notes?.message}</FormErrorText> : null}
              </TkCol>
            </TkRow>
          </TkModalBody>
          {clientData.isError ? <FormErrorBox errMessage={clientData.error?.message} /> : null}
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <TkButton type="button" disabled={clientData.isLoading} onClick={onCancel} color="secondary">
                Close
              </TkButton>
              <TkButton type="submit" loading={clientData.isLoading} color="primary" id="add-btn">
                Add Client
              </TkButton>
            </div>
          </div>
        </TkForm>
      </TkModal>
    </React.Fragment>
  );
};

export default AllClients;
