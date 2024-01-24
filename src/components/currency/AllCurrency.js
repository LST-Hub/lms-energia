import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Loader from "../../utils/Loader";
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import TkButton from "../TkButton";
import TkRow, { TkCol } from "../TkRow";
import TkCard, { TkCardBody, TkCardTitle, TkCardHeader } from "../TkCard";
import TkIcon from "../TkIcon";
import TkInput from "../forms/TkInput";
import TkForm from "../forms/TkForm";
import TkTableContainer from "../TkTableContainer";
import { API_BASE_URL, MaxNameLength, MinNameLength, RQ } from "../../utils/Constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tkFetch from "../../utils/fetch";
import { TkToastError, TkToastSuccess } from "../TkToastContainer";
import FormErrorText, { FormErrorBox } from "../forms/ErrorText";
import TkSelect from "../forms/TkSelect";
import TkAccessDenied from "../TkAccessDenied";
import TkLoader from "../TkLoader";
import TkNoData from "../TkNoData";
import { TkDropdownItem, TkDropdownMenu, TkDropdownToggle, TkUncontrolledDropdown } from "../TkDropdown";

const schema = Yup.object({
  currencySymbol: Yup.object().nullable().required("Select Currency"),
}).required();

const HeaderForm = ({ isLoading }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const queryClient = useQueryClient();
  const [allCurrencyCode, setAllCurrencyCode] = useState([]);
  const {
    data: currencyCodeData,
    isLoading: isCurrencyCodeLoading,
    isError: isCurrencyCodeError,
    error: currencyCodeError,
  } = useQuery({
    queryKey: [RQ.allCurrencyCode],
    queryFn: tkFetch.get(`${API_BASE_URL}/currency-code`),
  });

  useEffect(() => {
    if (isCurrencyCodeError) {
      TkToastError(currencyCodeError);
    }
  }, [isCurrencyCodeError, currencyCodeError]);

  useEffect(() => {
    if (currencyCodeData) {
      setAllCurrencyCode(
        currencyCodeData?.map((item) => ({ value: item.id, label: `${item.code} - ${item.country}` }))
      );
    }
  }, [currencyCodeData]);

  const currencyData = useMutation({
    mutationFn: tkFetch.post(`${API_BASE_URL}/currency`),
  });

  const onSubmit = (formData) => {
    const apiData = {
      currencyId: formData.currencySymbol.value,
    };
    currencyData.mutate(apiData, {
      onSuccess: (data) => {
        TkToastSuccess("Currency Added Successfully");
        setValue("currencySymbol", null);
        queryClient.invalidateQueries({
          queryKey: [RQ.allCurriencies],
        });
      },
      onError: (error) => {
        console.log("error", error);
      },
    });
  };

  return (
    <>
      {isLoading ? null : (
        <TkForm onSubmit={handleSubmit(onSubmit)}>
          <TkRow className="mt-3 mb-3 ms-auto">
            <TkCol lg={4}>
              <Controller
                name="currencySymbol"
                control={control}
                render={({ field }) => (
                  <TkSelect
                    {...field}
                    id="currencySymbol"
                    placeholder="Select Currency Name"
                    options={allCurrencyCode}
                    loading={isCurrencyCodeLoading}
                  />
                )}
              />
              {errors.currencySymbol?.message ? <FormErrorText>{errors.currencySymbol?.message}</FormErrorText> : null}
            </TkCol>
            <TkCol lg={4}>
              <TkButton color="primary" type="submit">
                <TkIcon className="ri-add-fill align-bottom"></TkIcon> Add Currency
              </TkButton>
            </TkCol>
          </TkRow>
        </TkForm>
      )}
    </>
  );
};

const AllCurrency = ({ accessLevel }) => {
  const queryClient = useQueryClient();

  const activeCurrencyStatus = useMutation({
    mutationFn: tkFetch.patch(`${API_BASE_URL}/currency`),
  });

  const activeCurrencyStatusChange = useCallback(
    (id, active) => {
      const apiData = {
        id: id,
        active: !active,
      };
      activeCurrencyStatus.mutate(apiData, {
        onSuccess: (data) => {
          TkToastSuccess(`Currency Status  ${active === true ? "Inactivated" : "Activated"} Successfully`);
          queryClient.invalidateQueries({
            queryKey: [RQ.allCurriencies],
          });
        },
        onError: (error) => {
          console.log("error", error);
        },
      });
    },
    [activeCurrencyStatus, queryClient]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Currency",
        accessor: "country",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="">{cellProps.value}</div>;
        },
      },

      {
        Header: "Code",
        accessor: "code",
        filterable: false,
        Cell: (cellProps) => {
          return <div className="">{cellProps.value}</div>;
        },
      },
      {
        Header: "Status",
        accessor: "active",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.value === true ? (
                <span className="badge badge-soft-success rounded-pill text-uppercase">{`Active`}</span>
              ) : (
                <span className="badge badge-soft-danger rounded-pill text-uppercase">{`Inactive`}</span>
              )}
            </div>
          );
        },
      },
      {
        Header: "",
        filterable: false,
        Cell: (cellProps) => {
          return (
            <div className="">
              <TkUncontrolledDropdown direction="start" className="text-start">
                <TkDropdownToggle tag="a" id="dropdownMenuLink2" role="button">
                  <TkIcon className="ri-more-fill fs-4"></TkIcon>
                </TkDropdownToggle>
                <TkDropdownMenu>
                  <TkDropdownItem
                    className="edit-list"
                    onClick={() => activeCurrencyStatusChange(cellProps.row.original.id, cellProps.row.original.active)}
                  >
                    <TkIcon className="ri-indeterminate-circle-line me-2 align-bottom text-muted"></TkIcon>
                    {"Inactive"}
                  </TkDropdownItem>
                  <TkDropdownItem className="edit-list">
                    <TkIcon className="ri-delete-bin-line me-2 align-bottom text-muted"></TkIcon>
                    {"Delete"}
                  </TkDropdownItem>
                </TkDropdownMenu>
              </TkUncontrolledDropdown>
            </div>
          );
        },
      },
    ],
    [activeCurrencyStatusChange]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allCurriencies],
    queryFn: tkFetch.get(`${API_BASE_URL}/currency`),
  });

  if (!accessLevel) {
    return <TkAccessDenied />;
  }

  return (
    <React.Fragment>
      <div className="row justify-content-center">
        <TkCol>
          <TkCard id="tasksList">
            <HeaderForm isLoading={isLoading} />
            <TkCardBody className="table-padding pt-0">
              {/* TODO: hide pagination for this table */}
              {isLoading ? (
                <TkLoader />
              ) : isError ? (
                <FormErrorBox errMessage={error} />
              ) : data?.length > 0 ? (
                <TkTableContainer
                  columns={columns}
                  data={data}
                  isSearch={false}
                  showPagination={true}
                  defaultPageSize={10}
                  customPageSize={true}
                />
              ) : (
                <TkNoData />
              )}
            </TkCardBody>
          </TkCard>
        </TkCol>
      </div>
    </React.Fragment>
  );
};

export default AllCurrency;
