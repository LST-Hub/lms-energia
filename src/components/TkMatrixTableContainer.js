import React from "react";
import { useTable } from "react-table";
import { Table } from "reactstrap";

function MatrixTable({ columns, rows }) {
  const data = React.useMemo(() => {
    return rows.map((row) => {
      return columns.reduce(
        (obj, column) => {
          obj[column] = row[column];
          return obj;
        },
        { rowHeader: row.rowHeader }
      );
    });
  }, [columns, rows]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows: tableRows,
    prepareRow,
  } = useTable({
    columns: React.useMemo(
      () => [
        // Define the row headers column
        {
          Header: "",
          accessor: "rowHeader",
        },
        // Define the data columns
        ...columns.map((column) => {
          return {
            Header: column,
            accessor: column,
          };
        }),
      ],
      [columns]
    ),
    data,
  });

  return (
    <div className={"table-responsive table-card mb-3"}>
      <Table hover {...getTableProps()} className={"align-middle mb-0"}>
        <thead className={"table-light"}>
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th key={column.id} className={"table-light text-muted"} {...column.getHeaderProps()}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {tableRows.map((row) => {
            prepareRow(row);
            return (
              <tr key={row.getRowProps().key} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td key={cell.id} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default MatrixTable;
