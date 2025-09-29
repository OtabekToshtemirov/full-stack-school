"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainerClient";
import { useDeleteTeacher } from "@/hooks/useTeachers";
import { useDeleteStudent } from "@/hooks/useStudents";
import { useDeleteClass } from "@/hooks/useClasses";
import { useDeleteSubject } from "@/hooks/useSubjects";

// Delete hooklar komponent ichida ishlatiladi

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <h1>Loading...</h1>,
});
// TODO: OTHER FORMS

// Default form komponenti mavjud bo'lmagan table'lar uchun
const DefaultForm = ({ setOpen, type, table }: { setOpen: Dispatch<SetStateAction<boolean>>, type: string, table: string }) => (
  <div className="p-4 flex flex-col gap-4">
    <h2 className="text-lg font-semibold">{table} Form</h2>
    <p className="text-gray-500">Bu form hali yaratilmagan.</p>
    <button 
      onClick={() => setOpen(false)}
      className="bg-blue-500 text-white py-2 px-4 rounded-md"
    >
      Yopish
    </button>
  </div>
);

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  // Mavjud bo'lmagan formalar uchun default form
  parent: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="parent" />,
  lesson: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="lesson" />,
  assignment: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="assignment" />,
  result: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="result" />,
  event: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="event" />,
  announcement: (setOpen, type) => <DefaultForm setOpen={setOpen} type={type} table="announcement" />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    // Delete mutation hooklar
    const deleteTeacherMutation = useDeleteTeacher();
    const deleteStudentMutation = useDeleteStudent();
    const deleteClassMutation = useDeleteClass();
    const deleteSubjectMutation = useDeleteSubject();

    const handleDelete = async () => {
      if (!id) return;

      try {
        switch (table) {
          case "teacher":
            await deleteTeacherMutation.mutateAsync(id.toString());
            break;
          case "student":
            await deleteStudentMutation.mutateAsync(id.toString());
            break;
          case "class":
            await deleteClassMutation.mutateAsync(id.toString());
            break;
          case "subject":
            await deleteSubjectMutation.mutateAsync(id.toString());
            break;
          default:
            throw new Error(`Delete not implemented for ${table}`);
        }
        
        toast.success(`${table} muvaffaqiyatli o'chirildi!`);
        setOpen(false);
      } catch (error) {
        toast.error(`Xatolik: ${table} o'chirishda muammo bo'ldi`);
        console.error('Delete error:', error);
      }
    };

    const isDeleting = deleteTeacherMutation.isPending || 
                     deleteStudentMutation.isPending || 
                     deleteClassMutation.isPending || 
                     deleteSubjectMutation.isPending;

    return type === "delete" && id ? (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          Barcha ma'lumotlar yo'qotiladi. Haqiqatan ham bu {table}-ni o'chirmoqchimisiz?
        </span>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
        </button>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table] ? forms[table](setOpen, type, data, relatedData) : <DefaultForm setOpen={setOpen} type={type} table={table} />
    ) : (
      "Form topilmadi!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
