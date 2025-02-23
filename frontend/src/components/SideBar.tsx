// components/SideBar.tsx
import Link from "next/link";

export default function SideBar() {
  return (
    <aside className="w-52 bg-secondary text-white p-4 rounded-lg">
      <ul className="list-none p-0 m-0">
        <li className="mb-4">
          <Link href="/library">Library</Link>
        </li>
      </ul>
    </aside>
  );
}
