import { NavLink } from "react-router";
import Menu from "./header/Menu";
import Search from "./header/Search";
import Notification from "./header/Notification";
import logoLineUpYellow from "../../assets/icons/logoLineUp-Yellow.svg";

const navItems = [
  {
    id: "home",
    to: "/",
    label: "Home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="21"
        viewBox="0 0 22 21"
        fill="none"
      >
        <path
          d="M7.41667 20.0723H4.75C2.54086 20.0723 0.75 18.2814 0.75 16.0723V8.38591C0.75 6.98719 1.48061 5.69008 2.67679 4.96512L8.67679 1.32875C9.95105 0.556476 11.5489 0.556476 12.8232 1.32875L18.8232 4.96512C20.0194 5.69008 20.75 6.98719 20.75 8.38591V16.0723C20.75 18.2814 18.9591 20.0723 16.75 20.0723H14.0833M7.41667 20.0723V15.6278C7.41667 13.7869 8.90905 12.2945 10.75 12.2945C12.5909 12.2945 14.0833 13.7869 14.0833 15.6278V20.0723M7.41667 20.0723H14.0833"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "services",
    to: "/collabs",
    label: "Collabs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M3 10V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V10"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M14.834 21V15C14.834 13.8954 13.9386 13 12.834 13H10.834C9.72941 13 8.83398 13.8954 8.83398 15V21"
          stroke="white"
          strokeWidth="1.5"
          stroke-miterlimit="16"
        />
        <path
          d="M21.8183 9.36418L20.1243 3.43517C20.0507 3.17759 19.8153 3 19.5474 3H15.5L15.9753 8.70377C15.9909 8.89043 16.0923 9.05904 16.2532 9.15495C16.6425 9.38698 17.4052 9.81699 18 10C19.0158 10.3125 20.5008 10.1998 21.3465 10.0958C21.6982 10.0526 21.9157 9.7049 21.8183 9.36418Z"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M14 10C14.5675 9.82538 15.2879 9.42589 15.6909 9.18807C15.8828 9.07486 15.9884 8.86103 15.9699 8.63904L15.5 3H8.5L8.03008 8.63904C8.01158 8.86103 8.11723 9.07486 8.30906 9.18807C8.71207 9.42589 9.4325 9.82538 10 10C11.493 10.4594 12.507 10.4594 14 10Z"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M3.87567 3.43517L2.18166 9.36418C2.08431 9.7049 2.3018 10.0526 2.6535 10.0958C3.49916 10.1998 4.98424 10.3125 6 10C6.59477 9.81699 7.35751 9.38698 7.74678 9.15495C7.90767 9.05904 8.00913 8.89043 8.02469 8.70377L8.5 3H4.45258C4.18469 3 3.94926 3.17759 3.87567 3.43517Z"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "create",
    to: "/create",
    label: "Create",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M8 12H12M16 12H12M12 12V8M12 12V16"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "chats",
    to: "/chat",
    label: "Chats",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        Width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M10.75 20.75C16.2728 20.75 20.75 16.2728 20.75 10.75C20.75 5.22715 16.2728 0.75 10.75 0.75C5.22715 0.75 0.75 5.22715 0.75 10.75C0.75 12.5714 1.23697 14.2791 2.08782 15.75L1.25 20.25L5.75 19.4122C7.22087 20.263 8.92856 20.75 10.75 20.75Z"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "profile",
    to: "/profile",
    label: "Profile",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 18V17C7 14.2386 9.23858 12 12 12C14.7614 12 17 14.2386 17 17V18"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
        />
        <path
          d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
          stroke="white"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function Navbar({ 
  isVisible = true, 
  openSearch, 
  setOpenSearch,
  openNotification, 
  setOpenNotification,
  openMenu, 
  setOpenMenu 
}) {
  if (isVisible) return null;

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-[var(--color-primary-purple)] h-16 items-center px-8 justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logoLineUpYellow} alt="LineUp" className="h-8 w-auto" />
        </div>

        {/* Center Navigation */}
        <ul className="flex items-center gap-8 flex-1 justify-center">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `text-sm transition-all duration-200 px-4 py-2 rounded-xl ${
                    isActive
                      ? "text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpenSearch(!openSearch)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

          <button 
            onClick={() => setOpenNotification(!openNotification)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>

          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile: Full Screen Panels */}
      <div className="lg:hidden">
        {openSearch && <Search closeSearch={() => setOpenSearch(false)} />}
        {openNotification && (
          <Notification closeNotification={() => setOpenNotification(false)} />
        )}
        {openMenu && <Menu closeMenu={() => setOpenMenu(false)} />}
      </div>

      {/* Mobile Bottom Navbar */}
      <aside className="fixed bottom-0 w-full p-3 lg:hidden">
        <nav className="navbar">
        <ul className="navbar-links flex justify-between w-full p-2 bg-[var(--color-background-nav)] text-white rounded-full">
          {navItems.map((it, idx) => (
            <li key={it.id ?? idx}>
              <NavLink
                to={it.to}
                className={({ isActive, isPending }) =>
                  `flex flex-col items-center gap-1 p-3 transition-all duration-200 ${
                    isPending
                      ? "pending"
                      : isActive
                        ? "active"
                        : ""
                  }`
                }
              >
                {it.icon}
                <span className="text-[10px]">{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
    </>
  );
}
