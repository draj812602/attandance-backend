const express = require("express");
const {
  saveEmployee,
  getEmployee,
  markAttendance,
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/employee", saveEmployee);
router.get("/employee", getEmployee);
router.post("/attendance", markAttendance);

module.exports = router;
