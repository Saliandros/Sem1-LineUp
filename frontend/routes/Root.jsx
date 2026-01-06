import { Outlet, useLocation } from "react-router";
import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import Search from "../components/header/Search.jsx";
import Notification from "../components/header/Notification.jsx";
import Menu from "../components/header/Menu.jsx";

export default function Root() {
  const location = useLocation();
  const [openSearch, setOpenSearch] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="grow lg:flex lg:flex-col">
        {!isChatPage && (
          <div className="hidden lg:flex lg:justify-end">
            <header className="lg:w-[90%] md:w-[85%]">
              <Header />
            </header>
          </div>
        )}

        <header className="lg:hidden">
          <Header />
        </header>

        <div className="lg:flex md:flex">
          <aside className="hidden lg:block lg:w-[10%] md:w-[15%]">
            <div className="sticky top-0 h-screen">
              <Navbar 
                isVisible={isChatPage}
                openSearch={openSearch}
                setOpenSearch={setOpenSearch}
                openNotification={openNotification}
                setOpenNotification={setOpenNotification}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
            </div>
          </aside>

          <main className={`flex-1 lg:w-[90%] md:w-[85%] lg:pl-0 lg:pr-0`}>
            <Outlet />
          </main>
        </div>

        {/* Desktop Overlays - Rendered at Root level */}
        <div className="hidden lg:block">
          {openSearch && <Search closeSearch={() => setOpenSearch(false)} />}
          {openNotification && <Notification closeNotification={() => setOpenNotification(false)} />}
          {openMenu && <Menu closeMenu={() => setOpenMenu(false)} />}
        </div>
      </div>
      {!isChatPage && (
        <footer className="mt-auto lg:hidden">
          <Navbar 
            isVisible={isChatPage}
            openSearch={openSearch}
            setOpenSearch={setOpenSearch}
            openNotification={openNotification}
            setOpenNotification={setOpenNotification}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        </footer>
      )}
    </div>
  );
}
