export default function Search({ closeSearch }) {
  return (
    <section className="fixed top-0 left-0 z-10 w-full h-screen fade-in bg-neutral-light-gray">
      <header className="flex justify-between p-4 gap-1.5">
        <div className="flex gap-2.5 w-full p-2.5 bg-input-background items-center rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M11.334 11.333L14.0007 13.9997"
              stroke="#555555"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667C8.80864 12.6667 10.144 12.0676 11.1096 11.0995C12.0718 10.1348 12.6667 8.80354 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333Z"
              stroke="#555555"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input className="w-full" placeholder="Search"></input>
        </div>
        <button
          onClick={closeSearch}
          className="text-sm cursor-pointer min-w-auto"
        >
          Cancel
        </button>
      </header>
    </section>
  );
}
