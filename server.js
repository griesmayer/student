const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
// **NEW** add the path module
const path = require("path");
// **NEW** use the public/index.htlm file
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/students", (req, res) => {
  res.json(students);
});

app.get("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

app.post("/students", (req, res) => {
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: "Name and course are required!" });
  }

  const newId = students.length ? students[students.length - 1].id + 1 : 1;
  const newStudent = { id: newId, name, course };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: "Name and course are required!" });
  }

  const pos = students.findIndex(s => s.id === id);
  if (pos === -1) {
    return res.status(404).json({ error: "Student not found" });
  }
  students[pos] = { id, name, course };
  res.json(students[pos]);
});

app.patch("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, course } = req.body;

  const student = students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  if (name !== undefined) student.name = name;
  if (course !== undefined) student.course = course;

  res.json(student);
});

app.delete("/students/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const pos = students.findIndex(s => s.id === id);

  if (pos === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(pos, 1);
  return res.status(204).send(); // No Content
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});