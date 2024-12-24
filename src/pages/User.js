import React, { useState, useEffect } from "react";
import { Table, Pagination, Form, Button } from "react-bootstrap";
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fetchUserData, deleteUser, insertUser, checkMail} from '../api/UserApi';
import { useNavigate } from 'react-router-dom';
import {  insertLogs  } from '../api/LogsApi';
import AddUserModal from "../components/UserModal"; 
import SendMailModal from "../components/SendMailModal"; 

export default function DataTable() {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendMailModal, setShowSendMailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // เก็บข้อมูลผู้ใช้ที่เลือก
  const userEmail = sessionStorage.getItem('userEmail');
  const userUuid = sessionStorage.getItem('userUuid');
  const handleSendMailClick = (person) => {
    setSelectedUser(person); // ตั้งค่าผู้ใช้ที่เลือก
    setShowSendMailModal(true); // เปิด Modal
  };
  const navigate = useNavigate();
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
      return null; // กรณีเกิดข้อผิดพลาด จะส่งค่า null กลับ
    }
  };
  const handleSendMailClose = () => {
    setShowSendMailModal(false); // ปิด Modal
    setSelectedUser(null); // เคลียร์ข้อมูลผู้ใช้ที่เลือก
  };
  // State สำหรับ Modal Add User
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    uuid: "",
    email: "",
    firstName: "",
    lastName: "",
    profileImg: "",
    mobileNo: "",
    birthDate: "",
    createdBy: "admin",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchData = async () => {
    const dataTablesInput = {
      draw: currentPage,
      start: (currentPage - 1) * itemsPerPage,
      length: itemsPerPage,
      search: { value: searchQuery },
      order: [{ column: 2, dir: "desc" }],
      columns: [{ data: "firstName", searchable: true, orderable: true }, { data: "lastName", searchable: true, orderable: true },{ data: "createdAt", searchable: false, orderable: true }]
    };

    try {
        const result = await fetchUserData(dataTablesInput);
        if (result.data && result.recordsTotal !== undefined) {
           // save logs
           const ipAddress = await getIPAddress(); 
           const logData = {
             uuid: "",
             email: userEmail,
            userUuid: userUuid,
             ipAddress: ipAddress,
             description: "fetchUserData, searchUserdata, Userpaging" ,
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const handleDelete = async (person) => {
    try {
      // แสดง dialog ยืนยันการลบ
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });
  
      // ถ้าผู้ใช้กด 'Yes'
      if (result.isConfirmed) {
        const deleteResult = await deleteUser(person.uuid);
        if (deleteResult === "success") {
          // save logs
      const ipAddress = await getIPAddress(); 
      const logData = {
        uuid: "",
        email: userEmail,
          userUuid: userUuid,
        ipAddress: ipAddress,
        description: "user has been deleted "+person.email ,
      };
      await insertLogs(logData);
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          fetchData();
        } else {
          Swal.fire('Error!', 'Failed to delete user.', 'error');
        }
      }
    } catch (error) {
         // save logs
         const ipAddress = await getIPAddress(); 
         const logData = {
           uuid: "",
           email: userEmail,
          userUuid: userUuid,
           ipAddress: ipAddress,
           description: "Error deleting user:", error ,
         };
         await insertLogs(logData);
      console.error("Error deleting user:", error);
      Swal.fire('Error!', 'An error occurred while deleting the user.', 'error');
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

  // เปิด/ปิด Modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setIsEdit(false);
    setShowModal(false);
    setFormData({
      uuid: "",
      email: "",
      firstName: "",
      lastName: "",
      profileImg: "",
      mobileNo: "",
      birthDate: "",
      createdBy: "admin",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setFormData({ ...formData, profileImg: reader.result });
    reader.readAsDataURL(file);
  };

  const validateForm = async () => {
    let isValid = true;
    let tempErrors = {};
  
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format.";
      isValid = false;
    } else {
      try {
        console.log(isEdit)
        if(!isEdit){
          // ตรวจสอบว่าอีเมลซ้ำหรือไม่
          const isDuplicate = await checkMail(formData.email);
          if (!isDuplicate) {
            tempErrors.email = "Email already exists.";
            isValid = false;
          }
        }
       
      } catch (error) {
        console.error("Error checking email:", error);
        tempErrors.email = "Unable to validate email. Please try again.";
        isValid = false;
      }
    }
  
    if (!formData.mobileNo || !/^0\d{2}-\d{3}-\d{4}$/.test(formData.mobileNo)) {
      tempErrors.mobileNo = "Invalid mobile number format (0xx-xxx-xxxx).";
      isValid = false;
    }
  
    if (!formData.firstName) {
      tempErrors.firstName = "First name is required.";
      isValid = false;
    }
  
    if (!formData.lastName) {
      tempErrors.lastName = "Last name is required.";
      isValid = false;
    }
    if (!formData.birthDate) {
      tempErrors.birthDate = "Birth date is required.";
      isValid = false;
    }
  
    setErrors(tempErrors);
    return isValid;
  };
  
  const handleEdit = (user) => {
    setFormData(user); // เติมข้อมูลของผู้ใช้ที่ต้องการแก้ไข
    setIsEdit(true); // ตั้งค่าเป็นแก้ไข
    setShowModal(true);
  };
  const prepareFormData = (data) => {
    const preparedData = { ...data };
    if (data.birthDate) {
      // แปลงค่ากลับเป็นรูปแบบ ISO 8601
      preparedData.birthDate = new Date(data.birthDate).toISOString();
    }
    return preparedData;
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    // เรียก validateForm และรอผลลัพธ์
    const isValid = await validateForm();
    if (!isValid) return; // หากฟอร์มไม่ถูกต้องให้หยุดการทำงาน
  
    const preparedData = prepareFormData(formData); // แปลงข้อมูลก่อนส่ง API
  
    try {
      const result = await insertUser(preparedData);
      if (result) {
        const ipAddress = await getIPAddress();
        const logData = {
          uuid: "",
          email: userEmail,
          userUuid: userUuid,
          ipAddress: ipAddress,
          description: isEdit
            ? "Updated user information " + preparedData.email
            : "Added new user " + preparedData.email,
        };
        await insertLogs(logData);
        Swal.fire({
          icon: "success",
          title: isEdit
            ? "User updated successfully"
            : "User added successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchData();
        handleCloseModal();
      } else {
        Swal.fire({
          icon: "error",
          title: isEdit ? "Failed to update user" : "Failed to add user",
          text: "There was an issue.",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };
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
  const handleSetPassword = (uuid) => {
    navigate(`/setpassword/${uuid}`);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));  // Update the items per page
    setCurrentPage(1);  // Reset to first page when changing items per page
  };
  return (
    <div className="container mt-5">
      <h1 className="mb-4">User Profiles</h1>

        <div className="d-flex justify-content-end mb-3">
            <Button className="btn btn-success" onClick={handleShowModal}>Add User</Button>
        </div>
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
          placeholder="Search by First Name or Last Name"
          value={searchQuery}
          onChange={handleSearch}
        />
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>No</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Profile</th>
            <th>Birth Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((person, index) => (
            <tr key={person.uuid}>
              <td  className="text-center">{indexOfFirstItem + index + 1}</td>
              <td>{person.firstName}</td>
              <td>{person.lastName}</td>
              <td>{person.email}</td>
              <td>{person.mobileNo}</td>
              <td  className="text-center">
                <img
                  src={person.profileImg || "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg"}
                  alt="profile"
                  className="rounded-circle"
                  width="40"
                  height="40"
                  onError={(e) => (e.target.src = "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg")}
                />
              </td>
              <td  className="text-center">{convertToBuddhistYear(person.birthDate)}</td>
              <td className="text-center">
              {person.uuid !== "1f589cae-c6cd-4f44-9f52-2b9a4f740bf6" && (
                <>
                  <button className="btn btn-info btn-sm me-2" onClick={() => handleSetPassword(person.uuid)}>
                    <i className="fas fa-key"></i>
                  </button>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleSendMailClick(person)}>
                    <i className="fas fa-envelope"></i>
                  </button>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(person)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(person)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
              </td>
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

      {/* Modal User */}
      <AddUserModal
        show={showModal}
        handleClose={handleCloseModal}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSave={handleSave}
        formData={formData}
        errors={errors}
        isEdit={isEdit}
      />
       {/* Modal mail */}
       <SendMailModal
        show={showSendMailModal}
        handleClose={handleSendMailClose}
        user={selectedUser}
      />
    </div>
  );
}
