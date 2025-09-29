"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Student {
  id: string;
  name: string;
  surname: string;
  attendance?: {
    id: number;
    present: boolean;
  };
}

interface Lesson {
  id: number;
  name: string;
  subject: {
    name: string;
  };
  class: {
    name: string;
    students: Student[];
  };
}

interface AttendanceData {
  studentId: string;
  present: boolean;
}

const AttendanceManagement = ({ teacherId }: { teacherId?: string }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // O'qituvchining darslarini yuklash
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/teacher-lessons?teacherId=${teacherId}`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data);
        }
      } catch (error) {
        console.error('Darslarni yuklashda xatolik:', error);
        toast.error('Darslarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchLessons();
    }
  }, [teacherId]);



  // Dars tanlaganda o'quvchilar ro'yxatini yuklash
  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    // Bugungi sanada darsga qatnashgan o'quvchilar ma'lumotlarini yuklash
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(`/api/attendance?lessonId=${lesson.id}&date=${today}`);
      let existingAttendance = [];
      
      if (response.ok) {
        existingAttendance = await response.json();
      }

      // Har bir o'quvchi uchun dastlabki qatnashish ma'lumotlarini tayyorlash
      const initialAttendance = lesson.class.students.map((student) => {
        const existing = existingAttendance.find((att: any) => att.studentId === student.id);
        return {
          studentId: student.id,
          present: existing ? existing.present : true // Default: keldi
        };
      });

      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error('Qatnashish ma\'lumotlarini yuklashda xatolik:', error);
      // Default qiymatlarni o'rnatish
      const defaultAttendance = lesson.class.students.map((student) => ({
        studentId: student.id,
        present: true
      }));
      setAttendanceData(defaultAttendance);
    }
  };

  // Qatnashishni o'zgartirish
  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId ? { ...item, present } : item
      )
    );
  };

  // Qatnashishni saqlash
  const handleSaveAttendance = async () => {
    if (!selectedLesson) return;

    setSaveLoading(true);
    try {
      // Joriy vaqtni to'liq formatda olish (sana va vaqt bilan)
      const attendanceDateTime = new Date();
      
      const response = await fetch('/api/bulk-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: selectedLesson.id,
          dateTime: attendanceDateTime.toISOString(),
          attendanceData
        }),
      });

      if (response.ok) {
        toast.success('Qatnashish muvaffaqiyatli saqlandi');
      } else {
        toast.error('Qatnashishni saqlashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Qatnashishni saqlashda xatolik:', error);
      toast.error('Qatnashishni saqlashda xatolik yuz berdi');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Yuklanmoqda...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Davomat boshqaruvi</h2>
      
      {/* Darslar ro'yxati */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Darsni tanlang:
        </label>
        <select
          value={selectedLesson?.id || ''}
          onChange={(e) => {
            const lesson = lessons.find(l => l.id === parseInt(e.target.value));
            if (lesson) handleLessonSelect(lesson);
          }}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Darsni tanlang...</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.subject.name} - {lesson.class.name} - {lesson.name}
            </option>
          ))}
        </select>
      </div>

      {/* O'quvchilar jadvali */}
      {selectedLesson && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {selectedLesson.subject.name} - {selectedLesson.class.name} o'quvchilari
            </h3>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Vaqt: {new Date().toLocaleString('uz-UZ')}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    O'quvchi ismi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Davomat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedLesson.class.students.map((student, index) => {
                  const attendance = attendanceData.find(item => item.studentId === student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name} {student.surname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={attendance?.present === true}
                              onChange={() => handleAttendanceChange(student.id, true)}
                              className="form-radio h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-sm text-green-600">Keldi</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={attendance?.present === false}
                              onChange={() => handleAttendanceChange(student.id, false)}
                              className="form-radio h-4 w-4 text-red-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-sm text-red-600">Kelmadi</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Saqlash tugmasi */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saveLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saveLoading ? 'Saqlanmoqda...' : 'Davomatni saqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;