import express, { type Request, type Response } from "express";
import { fromFileUrl } from "@std/path";
// import cookieParser from "cookie-parser";
import session from "express-session";
import { PrismaClient } from "./prisma/generatedclient/client.ts";
const prisma = new PrismaClient();

const app = express();
// app.use(cookieParser());
app.use(
  session({
    secret: Deno.env.get("SESSION_SECRET") ?? "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);
app.use(express.json());

type ListenError = Error & { code?: string };

const portRaw = Deno.env.get("PORT") ?? "3000";
const port = Number(portRaw);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(
    `Invalid PORT value '${portRaw}'. Expected an integer between 1 and 65535.`,
  );
  Deno.exit(1);
}

const publicDir = fromFileUrl(new URL("./public", import.meta.url));

app.get("", (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  res.sendFile("index.html", { root: publicDir });
});
app.get("/students", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const students = await prisma.student.findMany();
  res.json(students);
});

app.get(
  "/students/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
    req: Request<
      Record<string, never>,
      unknown,
      { name?: string; course?: string }
    >,
    res: Response,
  ) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await prisma.student.delete({
      where: { id: parseInt(req.params.id) },
    });
    return res.status(204).send(); // No Content
  },
);

app.post("/chkpass", async (req: Request, res: Response) => {
  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.status(400).json({ error: "User and password are required!" });
  }
  if (user === "admin" && pass === "admin") {
    req.session.user = user;
    return res.json({ status: "ok", message: "Credentials are valid.", user });
  }
  const result = await fetch("https://grafg1.spengergasse.at/verify", {
    method: "POST",
    body: JSON.stringify({ user, passwd: pass }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await result.json();
  if (result.ok) {
    req.session.user = user; // ab jetzt ist der User eingeloggt. req.session.user ist dank der express-session Middleware
    // gesetzt in allen nachfolgenden Requests
    // const json = { status: "ok", message: "Credentials are valid.", user };
    return res.json(json);
  }
  return res.status(401).json(json);
});
app.post(
  "/login",
  express.urlencoded({ extended: true }),
  async (req: Request, res: Response) => {
    const user = typeof req.body?.user === "string" ? req.body.user : undefined;
    const pass = typeof req.body?.pass === "string" ? req.body.pass : undefined;

    if (!user || !pass) {
      return res.status(400).json({ error: "User and password are required!" });
    }
    if (user === "admin" && pass === "admin") {
      req.session.user = user;
      return res.redirect("/");
    }
    const result = await fetch("https://grafg1.spengergasse.at/verify", {
      method: "POST",
      body: JSON.stringify({ user, passwd: pass }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await result.json();
    if (result.ok) {
      req.session.user = user; // ab jetzt ist der User eingeloggt. req.session.user ist dank der express-session Middleware
      // gesetzt in allen nachfolgenden Requests
      // const json = { status: "ok", message: "Credentials are valid.", user };
      return res.redirect("/");
      //       return res.json(json);
    }
    return res.status(401).json(json);
  },
);

app.use(express.static(publicDir));

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

server.on("error", (err: ListenError) => {
  if (err?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
  } else if (err?.code === "EACCES") {
    console.error(`Permission denied binding to port ${port}.`);
  } else {
    console.error("Failed to start server:", err);
  }
  Deno.exit(1);
});
