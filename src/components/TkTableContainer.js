import React, { useRef, useEffect } from "react";
// import TableContainer from "../utils/TableContainer";
import PropTypes from "prop-types";
import TkInput from "./forms/TkInput";
import {
  useTable,
  useGlobalFilter,
  // useAsyncDebounce, // gives problem
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
  useRowSelect,
} from "react-table";
import { Table } from "reactstrap";
import { DefaultColumnFilter } from "../utils/Filter";
import { TaskListGlobalFilter } from "../utils/SearchFilters";
import TkRow, { TkCol } from "./TkRow";
import TkButton from "./TkButton";
import TkIcon from "./TkIcon";
import { TkCardBody } from "./TkCard";
import { environment } from "../utils/Constants";

// Define a default UI for filtering
function GlobalFilter({ isSearch, onSearchChange, isFilters }) {
  return (
    <>
      <TkCardBody className="border border-dashed border-end-0 border-start-0">
        <TkRow>
          {isSearch && (
            <TkCol sm={4}>
              <div className={"search-box me-2 mb-2 d-inline-block col-12"}>
                <TkInput
                  onChange={(e) => onSearchChange(e)}
                  id="search-bar-0"
                  type="text"
                  className="form-control search /"
                  placeholder={`Search...`}
                />
                <TkIcon className="bx bx-search-alt search-icon"></TkIcon>
              </div>
            </TkCol>
          )}
          {/* remove the filters temporarly */}
          {isFilters && <TaskListGlobalFilter />}
        </TkRow>
      </TkCardBody>
    </>
  );
}

const IndeterminateCheckbox = React.forwardRef(function IndeterminateCheckbox(
  { indeterminate, disabled, ...rest },
  ref
) {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <TkInput type="checkbox" disabled={disabled} ref={resolvedRef} {...rest} />
    </>
  );
});

export default function TkTableContainer(props) {
  const {
    columns,
    data,
    defaultPageSize,
    showAddButton,
    onClickAdd,
    disableAddButton,
    showPagination,
    rowSelection,
    onRowSelection,
    showSelectedRowCount,
    customPageSize,
    loading,
    Toolbar,
    getInitialSelectedRows,
    getRowId,
    disableRowSelectChkBox,
    dynamicTable,
  } = props;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      // disableSortBy: false,
      defaultColumn: { Filter: DefaultColumnFilter },
      getRowId: getRowId
        ? getRowId
        : (row, relativeIndex, parent) => (parent ? [parent.id, relativeIndex].join(".") : relativeIndex),
      initialState: {
        pageIndex: 0,
        pageSize: defaultPageSize || 1000_000, // just a large number to show all rows on one page, It's just a workaround, and works all the time as no one is going to have pag size of 100,000
        selectedRowIds: getInitialSelectedRows ? getInitialSelectedRows() : {},
        // sortBy: [
        //   {
        //     desc: false,
        //   }, 
        // ],
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    (hooks) => {
      if (!rowSelection) return;
      hooks.visibleColumns.push((columns) => [
        // A column for selection
        {
          id: "selection",
          // you can use the table's getToggleAllRowsSelectedProps method here, as it will select all the rows that table has
          // currently we only select the rows of current page, wahtever the size of page is 10,20, etc.
          //not selcting all as we dont have all rows data on UI sometimes,as backend pass only 100 rows at a time while writing this comment,
          // so only selecting rows of current page, not all rows
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox disabled={disableRowSelectChkBox} {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox disabled={disableRowSelectChkBox} {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // kept this state for not calling onRowSelection on every render
  // as when parent of this component was getting re-rendred the the below useEffect was getting called
  // and again onRowSelection was getting called, so onRowSelection was getting called twice
  const previousChkSelectedLength = useRef(0);

  // if onRowSelection updates a state of parent component then it was causing infinite loop,
  // as calling onRowSelection updates a state of parent causing re-render of parent component, that again calls a rerender to this child component,
  // and as this child gets render it again calls onRowSelection, which again re-renders parent, and so on
  useEffect(() => {
    if (rowSelection && selectedFlatRows.length !== previousChkSelectedLength.current) {
      onRowSelection(selectedFlatRows);
      previousChkSelectedLength.current = selectedFlatRows.length;
    }
  }, [rowSelection, selectedFlatRows, onRowSelection]);

  if (environment !== "production") {
    if (showPagination && !defaultPageSize) {
      console.error(
        "pagination is true but no defaultPageSize prop is provided, without defaultPageSize pagination will not work, and all data will we shown on single page"
      );
    }
    if (rowSelection && !onRowSelection) {
      console.error("onRowSelection prop is required when rowSelection is true, It shold be a UseCallback  Function");
    }
  }

  const generateSortingIndicator = (column) => {
    return column.isSorted ? (column.isSortedDesc ? " ↓ " : " ↑ ") : "";
  };

  const onChangeInSelect = (event) => {
    setPageSize(Number(event.target.value));
  };
  const onChangeInInput = (event) => {
    let pageNum = Number(event.target.value) ? Number(event.target.value) - 1 : 0;
    pageNum = Math.floor(pageNum);
    gotoPage(pageNum);
  };

  return (
    <>
      <TkRow className="mb-2">{Toolbar ? Toolbar : null}</TkRow>
      {showSelectedRowCount ? (
        <TkRow className="mb-3">
          <TkCol>
            <p> {selectedFlatRows.length ? selectedFlatRows.length + " rows selected" : null} </p>
          </TkCol>
        </TkRow>
      ) : null}

      <div className={`${dynamicTable ? "" : `table-responsive`} table-card mb-3`}>
        <Table hover {...getTableProps()} className={"align-middle mb-0"}>
          <thead className={"table-light"}>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id} className={"table-light text-muted"} {...column.getSortByToggleProps()}>
                    {column.render("Header")}
                    {/*  if required sorting rows then uncomment the below, and adjust the generateSortingIndicator function if required, because not tested */}
                    {generateSortingIndicator(column)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {loading ? (
            <tbody>
              <tr>
                <td>
                  <div className="w-100 h-100 mx-auto d-flex justify-content-center align-items-center">
                    <div className="d-block spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : data.length === 0 ? (
            <tbody>
              <div className="w-100 h-100 mx-auto d-flex justify-content-center align-items-center">
                <p className="text-muted">No Data Found</p>
              </div>
            </tbody>
          ) : (
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr key={row.getRowProps().key}>
                    {row.cells.map((cell) => {
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
          <div>
            {showAddButton && (
              <TkButton type="button" className="ms-3" disabled={disableAddButton} onClick={onClickAdd}>
                +
              </TkButton>
            )}
          </div>
        </Table>
      </div>

      {showPagination && (
        <TkRow className="justify-content-md-end justify-content-center align-items-center p-2">
          {customPageSize && (
            <TkCol className="col-md-auto d-flex">
              {/* not using TkSelect intentionally */}
              <select className="form-select" value={pageSize} onChange={onChangeInSelect}>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </TkCol>
          )}
          <TkCol className="col-md-auto">
            <div className="d-flex gap-1">
              <TkButton color="primary" className="table-pagination" onClick={previousPage} disabled={!canPreviousPage}>
                {"<"}
              </TkButton>
            </div>
          </TkCol>
          <TkCol className="col-md-auto d-none d-md-block">
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
            Page
          </TkCol>
          <TkCol className="col-md-auto">
            <TkInput
              type="text"
              min={1}
              style={{ width: 70 }}
              max={pageOptions.length}
              defaultValue={pageIndex + 1}
              onChange={onChangeInInput}
            />
          </TkCol>

          <TkCol className="col-md-auto">
            <div className="d-flex gap-1">
              <TkButton color="primary" className="table-pagination" onClick={nextPage} disabled={!canNextPage}>
                {">"}
              </TkButton>
            </div>
          </TkCol>
        </TkRow>
      )}
    </>
  );
}

TkTableContainer.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  defaultPageSize: PropTypes.number,
  showPagination: PropTypes.bool,
  rowSelection: PropTypes.bool,
  onRowSelection: PropTypes.func,
  customPageSize: PropTypes.bool,
  showSelectedRowCount: PropTypes.bool,
  loading: PropTypes.bool,
  getRowId: PropTypes.func,
};

TkTableContainer.defaultProps = {
  defaultPageSize: 10,
  showPagination: false,
  rowSelection: false,
  customPageSize: false,
  showSelectedRowCount: false,
};
