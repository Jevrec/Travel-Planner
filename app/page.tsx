import Image from "next/image";
import Link from "next/link";
// app/page.tsx
export default function Home() {
  return (
    <div className="m-10 flex flex-row gap-4 bg-gray-300 p-4 rounded-2xl">
      <Link
        className="p-3 bg-blue-600 rounded-2xl hover:bg-blue-500"
        href={"/login"}
      >
        Login
      </Link>
      <Link
        className="p-3 bg-blue-600 rounded-2xl hover:bg-blue-500"
        href={"/register"}
      >
        Register
      </Link>
    </div>
  );
}
