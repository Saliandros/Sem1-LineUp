import { Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";

export default function Root() {
  const location = useLocation();

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
              <Navbar isVisible={isChatPage} />
            </div>
          </aside>

          <main className={`flex-1 lg:w-[90%] md:w-[85%]`}>
            <Outlet />
          </main>
        </div>
      </div>
      {!isChatPage && (
        <footer className="mt-auto lg:hidden">
          <Navbar isVisible={isChatPage} />
        </footer>
      )}
    </div>
  );
}
