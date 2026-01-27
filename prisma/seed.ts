import { PrismaClient } from "../generated/client.ts";

const prisma = new PrismaClient();

const students = [
  { id: -1, name: "Anna", course: "Computer Science" },
  { id: -2, name: "Susi", course: "Mathematics" },
  { id: -3, name: "Fritz", course: "English" },
  { id: -4, name: "Andrea", course: "Mathematics" },
  { id: -5, name: "Thomas", course: "German" },
  { id: -6, name: "Verena", course: "Mathematics" },
  { id: -7, name: "Marion", course: "Mathematics" },
  { id: -8, name: "Karl", course: "Computer Science" },
  { id: -9, name: "Hans", course: "Mathematics" },
  { id: -10, name: "Barbara", course: "Computer Science" },
];

async function main() {
  console.log("Start seeding...");
  
  for (const student of students) {
    await prisma.student.create({
      data: student,
    });
    console.log(`Created student with id: ${student.id}`);
  }
  
  console.log("Seeding finished.");
}

try {
    await main();
}
catch (e) {
    console.error(e);
    Deno.exit(1);
}
finally {
    await prisma.$disconnect();
}