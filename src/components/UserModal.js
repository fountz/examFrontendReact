import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function AddUserModal({
  show,
  handleClose,
  handleInputChange,
  handleFileChange,
  handleSave,
  formData,
  errors,
  isEdit,
}) {
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (formData.profileImg) {
      // ตั้งค่าภาพตัวอย่างเริ่มต้นจาก `formData.profileImg`
      setProfileImagePreview(formData.profileImg);
    } else {
      setProfileImagePreview(null); // รีเซ็ตถ้าไม่มีรูป
    }
  }, [formData.profileImg]);

  const formatMobileNo = (value) => {
    const formatted = value
      .replace(/\D/g, "")
      .match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!formatted) return value;
    return !formatted[2]
      ? formatted[1]
      : !formatted[3]
      ? `${formatted[1]}-${formatted[2]}`
      : `${formatted[1]}-${formatted[2]}-${formatted[3]}`;
  };

  const handleMobileChange = (e) => {
    const { value } = e.target;
    if (value.length <= 12) {
      handleInputChange({
        target: { name: "mobileNo", value: formatMobileNo(value) },
      });
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imagePreviewUrl = URL.createObjectURL(file);
      setProfileImagePreview(imagePreviewUrl);
      handleFileChange(e);
    }
  };

  const handleCloseModal = () => {
    setProfileImagePreview(null);
    handleClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal show={show} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit User" : "Add User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSave}>
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              className={isEdit ? "bg-light" : ""}
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!errors.email}
              readOnly={isEdit}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="mobileNo" className="mb-3">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="mobileNo"
              placeholder="0xx-xxx-xxxx"
              value={formData.mobileNo}
              onChange={handleMobileChange}
              isInvalid={!!errors.mobileNo}
            />
            <Form.Control.Feedback type="invalid">
              {errors.mobileNo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="firstName" className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="lastName" className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="birthDate" className="mb-3">
            <Form.Label>Birth Date</Form.Label>
            <Form.Control
              type="date"
              name="birthDate"
              value={formData.birthDate ? formatDate(formData.birthDate) : ""}
              onChange={handleInputChange}
              isInvalid={!!errors.birthDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.birthDate}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="profileImg" className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control type="file" onChange={handleProfileImageChange} />
            {profileImagePreview && (
              <div className="mt-3">
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </Form.Group>

          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
