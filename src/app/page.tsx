import { useEffect } from "react";
import { redirect } from "next/navigation";



export default function Home() {
  
  // Redirect to the jobs page on initial load
  useEffect(() => {
    redirect("/jobs");
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to the Job Portal
      </h1>
    </div>
  );
}
