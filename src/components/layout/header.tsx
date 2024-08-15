import { validateRequest } from "@/lib/lucia";
import { signOut } from "@/actions/auth.actions";
import Link from "next/link";
import Image from "next/image";

export async function Header() {
  const { user } = await validateRequest();

  return (
    <div className="navbar bg-base-100 h-[56px]">
      <div className="flex-1">
        {user && (
          <label
            htmlFor="my-drawer-2"
            className="btn btn-ghost drawer-button lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
        )}
        <Link href="/" className="btn btn-ghost text-xl">
          RewriteIT
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <div className="avatar placeholder">
                <div className="bg-base-300 text-base-content w-10 rounded-full">
                  <span className="text-xl">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="Avatar"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-user"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {!user && (
              <>
                <li>
                  <a href="/auth/signin">Sign In</a>
                </li>
                <li>
                  <a href="/auth/signup">Sign Up</a>
                </li>
              </>
            )}
            {user && (
              <>
                <li>
                  <span>Hello {user.username}</span>
                </li>
                <li></li>
                <li>
                  <a href="/auth/profile" className="justify-between">
                    Edit Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <form action={signOut}>
                    <button type="submit">Sign Out</button>
                  </form>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
