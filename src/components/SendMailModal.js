import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from 'sweetalert2';
import { sendMail } from "../api/UserApi"; // Import API function
import { insertLogs  } from '../api/LogsApi';

export default function SendMailModal({ show, handleClose, user }) {
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Mail from Exam");
  const [description, setDescription] = useState("");
  const userEmail = sessionStorage.getItem('userEmail');
  const userUuid = sessionStorage.getItem('userUuid');
  const [sendlink, setSendlink] = useState("");
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
  const handleSendMail = async (e) => {
    e.preventDefault();
    try {
      const fullDescription = `${description}`+"<br> Link for set Password : <a href='"+window.location.origin+"/setpassword/"+user.uuid+"'> click here </a>";
      const mailData = {
        email,
        topic,
        description: fullDescription,
      };
      const response = await sendMail(mailData); // Call sendMail API function
       // save logs
            const ipAddress = await getIPAddress(); 
            const logData = {
              uuid: "",
              email: userEmail,
              userUuid: userUuid,
              ipAddress: ipAddress,
              description: "send email to  "+mailData.email ,
            };
            await insertLogs(logData);
       Swal.fire({
                icon: 'success',
                title: response,
                showConfirmButton: false,
                timer: 1500,
              });
      handleClose(); // Close modal
    } catch (error) {
        const ipAddress = await getIPAddress(); 
        const logData = {
          uuid: "",
          email: mailData.email,
          userUuid: "", // ใช้ UUID จาก insertUser
          ipAddress: ipAddress,
          description: "Failed to send mail : "+error,
        };
         Swal.fire({
                  icon: 'error',
                  title: "Failed to send mail. Please try again.",
                  text: 'There was an issue.',
                });
    }
  };

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setDescription(
        `Hi ! ${user.firstName || ""} ${user.lastName || ""}. Have a nice day!`
      );
      setSendlink(" Link for set Password : "+window.location.origin+"/setpassword/"+user.uuid);
    }
  }, [user]);

  return (
    <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Send Mail</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleSendMail}>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>To</Form.Label>
          <Form.Control type="email" value={email} className="bg-light" readOnly />
        </Form.Group>

        <Form.Group controlId="topic" className="mb-3">
          <Form.Label>Topic</Form.Label>
          <Form.Control
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="sendlink" className="mb-3">
          <Form.Text className="text-muted mb-3">
            {sendlink}
          </Form.Text>
        </Form.Group>

        {/* ใช้ d-flex และ justify-content-center เพื่อจัดตำแหน่งปุ่มให้ตรงกลาง */}
        <Form.Group className="d-flex justify-content-center">
          <Button variant="primary" type="submit">
            Send Mail
          </Button>
        </Form.Group>
      </Form>
    </Modal.Body>
  </Modal>
  );
}
