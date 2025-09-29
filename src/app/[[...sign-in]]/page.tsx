"use client";

import { signIn, getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Agar user allaqachon login qilgan bo'lsa
    getSession().then((session: any) => {
      if (session?.user?.role) {
        router.push(`/${session.user.role}`);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError("Username yoki parol noto'g'ri");
      } else if (result?.ok) {
        router.push(`/${role}`);
      }
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 min-w-[400px]"
      >
        <div className="flex items-center gap-2 mb-4">
          <Image src="/logo.png" alt="" width={24} height={24} />
          <h1 className="text-xl font-bold">SchooLama</h1>
        </div>
        <h2 className="text-gray-400 mb-4">Hisobingizga kiring</h2>
        
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 rounded-md ring-1 ring-gray-300"
            required
          >
            <option value="admin">Administrator</option>
            <option value="teacher">O'qituvchi</option>
            <option value="student">O'quvchi</option>
            <option value="parent">Ota-ona</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 rounded-md ring-1 ring-gray-300"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded-md ring-1 ring-gray-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white rounded-md text-sm p-3 disabled:opacity-50"
        >
          {loading ? "Kirish..." : "Kirish"}
        </button>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Test accounts:</strong></p>
          <p>Admin: admin1 / admin123</p>
          <p>Teacher: teacher1 / teacher123</p>
          <p>Student: student1 / student123</p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
