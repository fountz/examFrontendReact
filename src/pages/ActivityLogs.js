import React, { useState, useEffect } from 'react';
import { Table, Pagination, Form, Button } from "react-bootstrap";
import { format } from 'date-fns';
import { fetchLogsData, insertLogs } from '../api/LogsApi';

const ActivityLogs = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendMailModal, setShowSendMailModal] = useState(false);
  const userEmail = sessionStorage.getItem('userEmail');
  const userUuid = sessionStorage.getItem('userUuid');
  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) {
        throw new Error("Failed to fetch IP address");
      }
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return null;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const convertToBuddhistYear = (dateString) => {
    const date = new Date(dateString);
    const buddhistYear = date.getFullYear() + 543;
    return `${format(date, "MM-dd-yyyy")}`;
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchData = async () => {
    const dataTablesInput = {
      draw: currentPage,
      start: (currentPage - 1) * itemsPerPage,
      length: itemsPerPage,
      search: { value: searchQuery },
      order: [{ column: 3, dir: "desc" }],
      columns: [
        { data: "email", searchable: true, orderable: true },
        { data: "ipAddress", searchable: true, orderable: true },
        { data: "description", searchable: false, orderable: true },
        { data: "createdAt", searchable: false, orderable: true }
      ]
    };

    try {
      const result = await fetchLogsData(dataTablesInput);
      if (result.data && result.recordsTotal !== undefined) {
        const ipAddress = await getIPAddress();
        const logData = {
          uuid: "",
          email: userEmail,
          userUuid: userUuid,
          ipAddress: ipAddress,
          description: "fetchLogsData, searchLogsdata, Logspaging",
        };
        await insertLogs(logData);
        setData(result.data);
        setTotalRecords(result.recordsTotal);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Define page range to display in pagination
  const pageRange = () => {
    const range = [];
    const maxPages = 5; // Max number of page items to display

    // Show pages near current page, ensuring it doesn't go below 1 or above totalPages
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    // Adjust if there are not enough pages before or after the current page
    if (currentPage <= 3) {
      endPage = Math.min(maxPages, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - maxPages + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));  // Update the items per page
    setCurrentPage(1);  // Reset to first page when changing items per page
  };
  return (
    <div className="container mt-5">
      <h1>Activity Logs</h1>
      <Form.Group className="mb-3">
        <Form.Label>Items per page</Form.Label>
        <Form.Control as="select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by User, IP Address, Details."
          value={searchQuery}
          onChange={handleSearch}
        />
      </Form.Group>
      <Table striped bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>No</th>
            <th>User</th>
            <th>IP Address</th>
            <th>Details</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log, index) => (
            <tr key={index}>
              <td className="text-center">{indexOfFirstItem + index + 1}</td>
              <td>{log.email}</td>
              <td>{log.ipAddress}</td>
              <td>{log.description}</td>
              <td className="text-center">{convertToBuddhistYear(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination>
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {pageRange().map((page) => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      </Pagination>
    </div>
  );
};

export default ActivityLogs;
