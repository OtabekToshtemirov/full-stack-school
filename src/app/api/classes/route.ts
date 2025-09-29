import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const supervisorId = searchParams.get('supervisorId');
    const gradeId = searchParams.get('gradeId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query filter
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (supervisorId) {
      where.supervisorId = supervisorId;
    }

    if (gradeId) {
      where.gradeId = parseInt(gradeId);
    }

    const [classes, totalCount] = await prisma.$transaction([
      prisma.class.findMany({
        where,
        include: {
          supervisor: {
            select: { name: true, surname: true },
          },
          grade: {
            select: { level: true },
          },
          _count: {
            select: {
              students: true,
              lessons: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      }),
      prisma.class.count({ where }),
    ]);

    return NextResponse.json({
      data: classes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Class mavjudligini tekshirish
    const existingClass = await prisma.class.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Class-ni o'chirish
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Class muvaffaqiyatli o\'chirildi' 
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Class o\'chirishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}