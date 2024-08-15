type SidebarProps = {
  children: React.ReactNode;
};

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu min-h-full w-60 shadow-lg bg-base-200 p-4 text-base-content lg:h-[calc(100vh-56px)]">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/protected">Protected</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
