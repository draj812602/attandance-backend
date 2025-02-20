const express = require("express");
const {
  saveEmployee,
  getEmployee,
  markAttendance,
  getAttendance,
  verifyOfficeIP,
  backdateAttendance,
} = require("../controllers/employeeController"); // Ensure all functions exist

const router = express.Router();

router.get("/verify-ip", verifyOfficeIP);
router.post("/employee", saveEmployee);
router.get("/employee", getEmployee);
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendance);
router.post("/backdate-attendance", backdateAttendance);

module.exports = router;
