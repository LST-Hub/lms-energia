import React, { useEffect, useState } from "react";
// import { Link } from 'react-router-dom';
import { Button, ButtonGroup } from "reactstrap";

import TkRow, { TkCol } from "../TkRow";
import TkInput from "../forms/TkInput";
import TkSelect from "../forms/TkSelect";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, RQ, statusFilterDropdownOptions } from "../../utils/Constants";
import tkFetch from "../../utils/fetch";
import { TkToastError } from "../TkToastContainer";
import TkContainer from "../TkContainer";

const TopBar = ({ onExpenseCategoryChange, onExpenseStatusChange }) => {
  const [allExpenseCategories, setAllExpenseCategories] = useState([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [RQ.allExpenseCategories],
    queryFn: tkFetch.get(`${API_BASE_URL}/expense-category/list?indexFilter=true`),
  });

  useEffect(() => {
    if (isError) {
      console.log("error", error);
      TkToastError("Error ocured while fetching Expense Categories");
    }
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const allExpenseCategories = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setAllExpenseCategories(allExpenseCategories);
    }
  }, [data]);

  return (
    <>
      <TkRow>
        <TkCol xs={12}>
        <div className="page-title-box">
          <TkContainer className="d-sm-flex space-childern fs-small align-items-center p-0">

            <TkCol lg={3}>
              <TkSelect
                placeholder="Select Expense Category"
                loading={isLoading}
                options={allExpenseCategories}
                onChange={onExpenseCategoryChange}
              />
            </TkCol>
            <TkCol lg={3}>
              <TkSelect
                placeholder="Select Expense Status"
                options={statusFilterDropdownOptions}
                onChange={onExpenseStatusChange}
              />
            </TkCol>
            {/* <TkCol lg={3}>
              <TkSelect placeholder="Select Priority" />
            </TkCol>
            <TkCol lg={3}>
              <TkSelect placeholder="Select Status" />
            </TkCol> */}
          </TkContainer>
          </div>
        </TkCol>
      </TkRow>
    </>
  );
};

export default TopBar;
