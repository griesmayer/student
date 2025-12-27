import express, { type Request, type Response } from "express";
import { fromFileUrl } from "@std/path";
import { PrismaClient } from "./prisma/generatedclient/client.ts";
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
const port = Deno.env.get("PORT") || 3000;
// **NEW** add the path module
// **NEW** use the public/index.htlm file

const publicDir = fromFileUrl(new URL("./public", import.meta.url));
app.use(express.static(publicDir));

app.get("/students", async (_req: Request, res: Response) => {
  const students = await prisma.student.findMany();
  res.json(students);
});

app.get(
  "/students/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  },
);

app.post(
  "/students",
  async (
    req: Request<Record<string, never>, unknown, { name?: string; course?: string }>,
    res: Response,
  ) => {
    const { name, course } = req.body;
    if (!name || !course) {
      return res.status(400).json({ error: "Name and course are required!" });
    }
    const newStudent = await prisma.student.create({
      data: { name, course },
    });
    res.status(201).json(newStudent);
  },
);

app.patch(
  "/students/:id",
  async (
    req: Request<{ id: string }, unknown, { name?: string; course?: string }>,
    res: Response,
  ) => {
    const id = parseInt(req.params.id);
    const { name, course } = req.body;

    if (!name || !course) {
      return res.status(400).json({ error: "Name and course are required!" });
    }
    const patchedStudent = await prisma.student.update({
      where: { id },
      data: { name, course },
    });
    res.json(patchedStudent); // TODO fix for wrong id
  },
);

app.delete(
  "/students/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    await prisma.student.delete({
      where: { id: parseInt(req.params.id) },
    });
    return res.status(204).send(); // No Content
  },
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
