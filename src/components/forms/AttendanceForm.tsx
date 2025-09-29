"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useFormState } from "react-dom";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import InputField from "../InputField";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";



const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: any;
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id,
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      present: data?.present ?? true,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || 0,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    console.log("Form data:", formData);
    formAction(formData);
  });

  const { lessons, students } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance record" : "Update attendance record"}
      </h1>
      
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors?.date}
        />
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
          >
            <option value="">Select a student</option>
            {students?.map((student: any) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId", { valueAsNumber: true })}
          >
            <option value="">Select a lesson</option>
            {lessons?.map((lesson: any) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} - {lesson.subject?.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Status</label>
          <div className="flex items-center gap-4">
            <Controller
              name="present"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="true"
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                      className="w-4 h-4"
                    />
                    <label className="text-xs">Present</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="false"
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                      className="w-4 h-4"
                    />
                    <label className="text-xs">Absent</label>
                  </div>
                </>
              )}
            />
          </div>
          {errors.present?.message && (
            <p className="text-xs text-red-400">
              {errors.present.message.toString()}
            </p>
          )}
        </div>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;