const express = require("express");
const app = express();
const port = 3000;

// **NEW** student list
const students = [
  { id:  1, name: "Anna",    course: "Computer Science" },
  { id:  2, name: "Susi",    course: "Mathematics" },
  { id:  3, name: "Fritz",   course: "English" },
  { id:  4, name: "Andrea",  course: "Mathematics" },
  { id:  5, name: "Thomas",  course: "German" },
  { id:  6, name: "Verena",  course: "Mathematics" },
  { id:  7, name: "Marion",  course: "Mathematics" },
  { id:  8, name: "Karl",    course: "Computer Science" },
  { id:  9, name: "Hans",    course: "Mathematics" },
  { id: 10, name: "Barbara", course: "Computer Science" }
];

app.get("/", (req, res) => {
  res.send("Hello, World from Express!");
});

// **NEW** route: /students
app.get("/students", (req, res) => {
  res.json(students);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});