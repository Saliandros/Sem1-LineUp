export default function Notification({ closeNotification }) {
  return (
    <section className="fixed top-0 left-0 z-10 w-full h-screen fade-in bg-neutral-light-gray">
      <header className="relative flex justify-center p-4 gap-1.5">
        <button className="absolute top-4 left-4" onClick={closeNotification}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 7L17 17M7 17L17 7"
              stroke="#212529"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h3 className="text-center">Notifications</h3>
      </header>
    </section>
  );
}
