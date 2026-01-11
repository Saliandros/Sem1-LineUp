import { Outlet, NavLink, redirect } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export async function clientAction({ request }) {
  try {
    const formData = await request.formData();

    // Debug - se hvad der sendes
    console.log("=== CLIENT ACTION DEBUG ===");
    console.log("All form data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, typeof value === "object" ? "FILE" : value);
    }

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const submissionTarget = formData.get("submission_target") || "posts";
    const endpoint =
      submissionTarget === "collaborations"
        ? `${API_BASE}/api/collaborations`
        : `${API_BASE}/api/posts`;

    console.log("Endpoint:", endpoint);

    // get token from supabase client (client-side)
    const { data: { session } = {} } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log("Token present:", !!token);

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      let err;
      try {
        err = await res.json();
      } catch {
        err = { message: "Request failed" };
      }
      console.error("Backend error:", err);
      return { error: err.message || "Request failed" };
    }

    const result = await res.json();
    console.log("Success:", result);

    if (submissionTarget === "collaborations") {
      return redirect("/collabs");
    }
    return redirect("/");
  } catch (error) {
    console.error("clientAction error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

export default function Create() {
  return (
    <div className="create-page pb-32 pt-6">
      <nav className="flex justify-center gap-9">
        <NavLink
          to="note"
          className={({ isActive }) =>
            `px-3 py-2 rounded-full leading-none  ${isActive ? "bg-primary-yellow text-black" : ""}`
          }
        >
          Note
        </NavLink>
        <NavLink
          to="request"
          className={({ isActive }) =>
            `px-3 py-2 rounded-full leading-none ${isActive ? "bg-primary-yellow text-black" : ""}`
          }
        >
          Request
        </NavLink>
      </nav>

      <main className="mt-6">
        <Outlet />
      </main>
    </div>
  );
}
