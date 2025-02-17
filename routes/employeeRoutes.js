const express = require("express");
const {
  saveEmployee,
  getEmployee,
  markAttendance,
  getAttendance, // ✅ Ensure this function is imported correctly
  verifyOfficeIP,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/employee", saveEmployee);
router.get("/employee", getEmployee);
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendance); // ✅ Ensure this route exists
router.get("/verify-ip", verifyOfficeIP);

module.exports = router;
