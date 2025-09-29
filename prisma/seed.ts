import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seeding started...");

  // Admin parollarini yangilash
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  try {
    await prisma.admin.upsert({
      where: { username: "admin1" },
      create: {
        username: "admin1",
        password: hashedPassword,
      },
      update: {
        password: hashedPassword,
      },
    });

    await prisma.admin.upsert({
      where: { username: "admin2" },
      create: {
        username: "admin2",
        password: hashedPassword,
      },
      update: {
        password: hashedPassword,
      },
    });

    console.log("✅ Admin users updated successfully!");
  } catch (error) {
    console.log("❌ Error updating admin users:", error);
  }

  // GRADE
  try {
    for (let i = 1; i <= 6; i++) {
      await prisma.grade.create({
        data: {
          level: i,
        },
      });
    }
    console.log("Grades created successfully!");
  } catch (error) {
    console.log("Grades may already exist, skipping...")
  }

  // CLASS
  try {
    for (let i = 1; i <= 6; i++) {
      await prisma.class.create({
        data: {
          name: `${i}A`, 
          gradeId: i, 
          capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
        },
      });
    }
    console.log("Classes created successfully!");
  } catch (error) {
    console.log("Classes may already exist, skipping...")
  }

  // SUBJECT
  try {
    const subjectData = [
      { name: "Mathematics" },
      { name: "Science" },
      { name: "English" },
      { name: "History" },
      { name: "Geography" },
      { name: "Physics" },
      { name: "Chemistry" },
      { name: "Biology" },
      { name: "Computer Science" },
      { name: "Art" },
    ];

    for (const subject of subjectData) {
      await prisma.subject.create({ data: subject });
    }
    console.log("Subjects created successfully!");
  } catch (error) {
    console.log("Subjects may already exist, skipping...")
  }

  // TEACHER
  try {
    const teacherPassword = await bcrypt.hash("teacher123", 10);
    for (let i = 1; i <= 15; i++) {
      await prisma.teacher.create({
        data: {
          id: `teacher${i}`, // Unique ID for the teacher
          username: `teacher${i}`,
          password: teacherPassword,
          name: `TName${i}`,
          surname: `TSurname${i}`,
          email: `teacher${i}@example.com`,
          phone: `123-456-789${i}`,
          address: `Address${i}`,
          bloodType: "A+",
          sex: i % 2 === 0 ? "MALE" : "FEMALE",
          subjects: { connect: [{ id: (i % 10) + 1 }] }, 
          classes: { connect: [{ id: (i % 6) + 1 }] }, 
          birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        },
      });
    }
    console.log("Teachers created successfully!");
  } catch (error) {
    console.log("Teachers may already exist, skipping...")
  }

  // LESSON
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`, 
        day: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"][Math.floor(Math.random() * 5)] as any, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)), 
        subjectId: (i % 10) + 1, 
        classId: (i % 6) + 1, 
        teacherId: `teacher${(i % 15) + 1}`, 
      },
    });
  }

  // PARENT
  try {
    const parentPassword = await bcrypt.hash("parent123", 10);
    for (let i = 1; i <= 25; i++) {
      await prisma.parent.create({
        data: {
          id: `parentId${i}`,
          username: `parentId${i}`,
          password: parentPassword,
          name: `PName ${i}`,
          surname: `PSurname ${i}`,
          email: `parent${i}@example.com`,
          phone: `123-456-789${i}`,
          address: `Address${i}`,
        },
      });
    }
    console.log("Parents created successfully!");
  } catch (error) {
    console.log("Parents may already exist, skipping...")
  }

  // STUDENT
  const studentPassword = await bcrypt.hash("student123", 10);
  for (let i = 1; i <= 50; i++) {
    await prisma.student.create({
      data: {
        id: `student${i}`, 
        username: `student${i}`, 
        password: studentPassword,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? "MALE" : "FEMALE",
        parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`, 
        gradeId: (i % 6) + 1, 
        classId: (i % 6) + 1, 
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
      },
    });
  }

  // EXAM
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // ASSIGNMENT
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`, 
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)), 
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // RESULT
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90, 
        studentId: `student${i}`, 
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }), 
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(), 
        present: true, 
        studentId: `student${i}`, 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`, 
        description: `Description for Event ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
        classId: (i % 5) + 1, 
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`, 
        description: `Description for Announcement ${i}`, 
        date: new Date(), 
        classId: (i % 5) + 1, 
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
