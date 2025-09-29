import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/student/form-data:
 *   get:
 *     summary: Student form uchun kerakli ma'lumotlarni olish
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Form ma'lumotlari muvaffaqiyatli qaytarildi
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Avtorizatsiya talab qilinadi" },
        { status: 401 }
      );
    }

    const studentGrades = await prisma.grade.findMany({
      select: { id: true, level: true },
    });
    const studentClasses = await prisma.class.findMany({
      include: { _count: { select: { students: true } } },
    });

    return NextResponse.json({
      classes: studentClasses,
      grades: studentGrades
    });

  } catch (error) {
    console.error("Student form data yuklashda xatolik:", error);
    return NextResponse.json(
      { error: "Server xatoligi" },
      { status: 500 }
    );
  }
}