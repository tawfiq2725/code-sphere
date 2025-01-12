import { backendUrl } from "@/utils/backendUrl";
import { showToast } from "@/utils/toastUtil";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
const page = () => {
  const router = useRouter();
  const [role, setRole] = React.useState("");
  const [email, setEmail] = React.useState("");

  useEffect(() => {
    // Get the email from query parameters
    const params = new URLSearchParams(window.location.search);
    const userEmail = params.get("email");

    if (userEmail) {
      setEmail(userEmail);
      localStorage.setItem("email", email);
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    try {
      const response = await fetch(`${backendUrl}/auth/set-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (data.success && data.data.role === "student") {
        router.push(`/student`);
      } else {
        showToast("Failed to set role", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("An error occurred", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="role"
          className="block text-sm font-medium text-zinc-200"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="" disabled>
            Select...
          </option>
          <option value="student">Student</option>
          <option value="tutor">Teacher</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>
    </form>
  );
};

export default page;
