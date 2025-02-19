const express = require("express");
const {
  saveEmployee,
  getEmployee, // ✅ Fixed function mapping
  markAttendance,
  getAttendance, // ✅ Fixed function mapping
  verifyOfficeIP,
  backdateAttendance,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/employee", saveEmployee);
router.get("/employee", getEmployee); // ✅ Fetch employee details
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendance); // ✅ Fetch attendance records
outer.post("/backdate-attendance", backdateAttendance);
router.get("/verify-ip", verifyOfficeIP);

module.exports = router;
