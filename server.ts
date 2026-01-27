import express, { Request, Response } from "express";
import path from "node:path";
import process from "node:process";
import session from "express-session";
import { PrismaClient } from "./generated/client.ts";
import accounts from "./accounts.json" with { type: "json" };

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET ||
      "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "schurlix",
    cookie: {
      maxAge: 5 * 60 * 1000, // 5 minutes
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }),
);
const port = process.env.PORT || 3000;
// **NEW** use the public/index.htlm file
app.use(express.static(path.join(import.meta.dirname || __dirname, "public")));

const prisma = new PrismaClient();

const students = await prisma.student.findMany();

app.get("/students", (_req: Request, res: Response) => {
  res.json(students);
});

app.get("/students/:id", (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(student);
});

app.post("/students", (req: Request, res: Response) => {
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: "Name and course are required!" });
  }

  const newId = students.length ? students[students.length - 1].id + 1 : 1;
  const newStudent = { id: newId, name, course };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/students/:id", (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  const { name, course } = req.body;

  if (!name || !course) {
    return res.status(400).json({ error: "Name and course are required!" });
  }

  const pos = students.findIndex((s) => s.id === id);
  if (pos === -1) {
    return res.status(404).json({ error: "Student not found" });
  }
  students[pos] = { id, name, course };
  res.json(students[pos]);
});

app.patch("/students/:id", (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  const { name, course } = req.body;

  const student = students.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  if (name !== undefined) student.name = name;
  if (course !== undefined) student.course = course;

  res.json(student);
});

app.delete("/students/:id", (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  const pos = students.findIndex((s) => s.id === id);

  if (pos === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  students.splice(pos, 1);
  return res.status(204).send(); // No Content
});

app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const account = accounts.find(
    (acc) => acc.username === username && acc.password === password
  );

  if (account) {
    req.session.user = { username: account.username };
    return res.json({ message: "Login successful" });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/loginstatus", (req: Request, res: Response) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.json({ loggedIn: false });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
