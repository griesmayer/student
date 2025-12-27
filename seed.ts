import { PrismaClient } from "./prisma/generatedclient/client.ts"
const prisma = new PrismaClient()

const students = [
    { name: "Anna", course: "Computer Science" },
    { name: "Susi", course: "Mathematics" },
    { name: "Fritz", course: "English" },
    { name: "Andrea", course: "Mathematics" },
    { name: "Thomas", course: "German" },
    { name: "Verena", course: "Mathematics" },
    { name: "Marion", course: "Mathematics" },
    { name: "Karl", course: "Computer Science" },
    { name: "Hans", course: "Mathematics" },
    { name: "Barbara", course: "Computer Science" },
];

async function main() {
    await prisma.student.createMany({
        data: students
    })

    const allStudents = await prisma.student.findMany()
    console.log("All students:", allStudents)
}

await main()