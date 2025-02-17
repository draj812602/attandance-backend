const express = require("express");
const {
  saveEmployee,
  getEmployee,
  markAttendance,
  getAttendance, // Added function for fetching attendance
  verifyOfficeIP,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/employee", saveEmployee);
router.get("/employee", getEmployee);
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendance); // New route for fetching attendance
router.get("/verify-ip", verifyOfficeIP);

module.exports = router;
