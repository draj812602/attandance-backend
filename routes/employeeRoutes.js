const express = require("express");
const {
  saveEmployee,
  getEmployee,
  markAttendance,
  verifyOfficeIP,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/employee", saveEmployee);
router.get("/employee", getEmployee);
router.post("/attendance", markAttendance);
router.get("/verify-ip", verifyOfficeIP);

module.exports = router;
