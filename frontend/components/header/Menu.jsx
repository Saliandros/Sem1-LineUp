import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext"

export default function Menu({ closeMenu }) {
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    closeMenu();
  };


  return (
   <section
      className={`fade-in fixed top-0 left-0 z-10 w-full h-screen bg-neutral-light-gray`}
    >
      <header className="relative flex justify-center p-4 gap-1.5">
        <button className="absolute top-4 left-4" onClick={closeMenu}>
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
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h3 className="text-center">Menu</h3>
      </header>
      <nav>
        <ul className="flex flex-col gap-9">
          {NavItems.map((link, index) => (
            <li
              key={index}
              className="flex justify-between w-full px-4 fade-up"
              style={{ "--delay": `${index * 60}ms` }}
            >
              {link.isLogout ? (
                <button
                  onClick={handleSignOut}
                  className="flex justify-between w-full"
                >
                  <div className="flex gap-2">
                    {link.icon}
                    {link.name}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#212529"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : (
                <Link to={link.href} className="flex justify-between w-full">
                  <div className="flex gap-2">
                    {link.icon}
                    {link.name}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#212529"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}


const NavItems = [
  
  {
    href: "/get-lineup-pro",
    name: "Get Pro lineUp",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <g clip-path="url(#clip0_1264_7910)">
          <path
            d="M9.95242 9.62272L11.5109 6.31816C11.711 5.89395 12.289 5.89395 12.4891 6.31816L14.0476 9.62272L17.5329 10.1559C17.9801 10.2243 18.1583 10.7996 17.8346 11.1296L15.313 13.7001L15.9081 17.3314C15.9845 17.7978 15.5168 18.1534 15.1167 17.9331L12 16.2177L8.88328 17.9331C8.48316 18.1534 8.01545 17.7978 8.09187 17.3314L8.68695 13.7001L6.16545 11.1296C5.8417 10.7996 6.01993 10.2243 6.46711 10.1559L9.95242 9.62272Z"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22 12L23 12"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 2V1"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 23V22"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20 20L19 19"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20 4L19 5"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 20L5 19"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 4L5 5"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1 12L2 12"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_1264_7910">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    href: "/saved",
    name: "Saved",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L13.0815 17.1953C12.4227 16.7717 11.5773 16.7717 10.9185 17.1953L5 21Z"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Insights",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M16 16L16 8"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 16L12 11"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 16L8 13"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z"
          stroke="#131927"
          stroke-width="1.5"
        />
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Invite friends",
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
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M1 18V17C1 15.3431 2.34315 14 4 14"
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M23 18V17C23 15.3431 21.6569 14 20 14"
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 14C5.10457 14 6 13.1046 6 12C6 10.8954 5.10457 10 4 10C2.89543 10 2 10.8954 2 12C2 13.1046 2.89543 14 4 14Z"
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 14C21.1046 14 22 13.1046 22 12C22 10.8954 21.1046 10 20 10C18.8954 10 18 10.8954 18 12C18 13.1046 18.8954 14 20 14Z"
          stroke="#1E1E1E"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Rate the app",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M11.072 4.31085C11.4079 3.47438 12.5921 3.47438 12.928 4.31085L14.3523 7.85774C14.4953 8.21394 14.8297 8.45683 15.2126 8.4828L19.0261 8.74137C19.9254 8.80235 20.2913 9.92853 19.5996 10.5065L16.6664 12.9571C16.3719 13.2033 16.2442 13.5963 16.3378 13.9685L17.2703 17.6752C17.4902 18.5494 16.5322 19.2454 15.7688 18.7661L12.5317 16.7338C12.2066 16.5297 11.7934 16.5297 11.4683 16.7338L8.23117 18.7661C7.46776 19.2454 6.50977 18.5494 6.72969 17.6752L7.66218 13.9685C7.75583 13.5963 7.62814 13.2033 7.33357 12.9571L4.40042 10.5065C3.70869 9.92853 4.07461 8.80235 4.97394 8.74137L8.78737 8.4828C9.17035 8.45683 9.50466 8.21394 9.6477 7.85774L11.072 4.31085Z"
          stroke="#212529"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <g clip-path="url(#clip0_1264_7962)">
          <path
            d="M10.1918 4.07219C10.8878 2.50481 13.1122 2.50481 13.8082 4.07219V4.07219C14.2359 5.03544 15.3437 5.49429 16.3272 5.11561V5.11561C17.9277 4.49943 19.5006 6.07235 18.8844 7.67277V7.67277C18.5057 8.65634 18.9646 9.7641 19.9278 10.1918V10.1918C21.4952 10.8878 21.4952 13.1122 19.9278 13.8082V13.8082C18.9646 14.2359 18.5057 15.3437 18.8844 16.3272V16.3272C19.5006 17.9277 17.9277 19.5006 16.3272 18.8844V18.8844C15.3437 18.5057 14.2359 18.9646 13.8082 19.9278V19.9278C13.1122 21.4952 10.8878 21.4952 10.1918 19.9278V19.9278C9.7641 18.9646 8.65634 18.5057 7.67277 18.8844V18.8844C6.07235 19.5006 4.49943 17.9277 5.11561 16.3272V16.3272C5.49429 15.3437 5.03544 14.2359 4.07219 13.8082V13.8082C2.50481 13.1122 2.50481 10.8878 4.07219 10.1918V10.1918C5.03544 9.76409 5.49429 8.65634 5.11561 7.67277V7.67277C4.49943 6.07235 6.07235 4.49943 7.67277 5.11561V5.11561C8.65634 5.49429 9.7641 5.03544 10.1918 4.07219V4.07219Z"
            stroke="#212529"
            stroke-width="1.5"
          />
          <circle cx="12" cy="12" r="3" stroke="#212529" stroke-width="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_1264_7962">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Help",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <g clip-path="url(#clip0_1264_7910)">
          <path
            d="M9.95242 9.62272L11.5109 6.31816C11.711 5.89395 12.289 5.89395 12.4891 6.31816L14.0476 9.62272L17.5329 10.1559C17.9801 10.2243 18.1583 10.7996 17.8346 11.1296L15.313 13.7001L15.9081 17.3314C15.9845 17.7978 15.5168 18.1534 15.1167 17.9331L12 16.2177L8.88328 17.9331C8.48316 18.1534 8.01545 17.7978 8.09187 17.3314L8.68695 13.7001L6.16545 11.1296C5.8417 10.7996 6.01993 10.2243 6.46711 10.1559L9.95242 9.62272Z"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22 12L23 12"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 2V1"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 23V22"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20 20L19 19"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20 4L19 5"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 20L5 19"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 4L5 5"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1 12L2 12"
            stroke="#131927"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_1264_7910">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    href: "/get-lineup-pro",
    name: "Log out",
    isLogout: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 12H19M19 12L16 15M19 12L16 9"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
          stroke="#131927"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
];
