/**
 * Social Media Links Komponent
 * Viser ikoner for sociale medier (Instagram, Facebook, TikTok, YouTube, X)
 */
export default function SocialMediaLinks() {
  const socialLinks = [
    {
      name: "Instagram",
      href: "#",
      img: <img src="/instagram.png" alt="Instagram" className="w-5 h-5" />,
    },
    {
      name: "FaceBook",
      href: "#",
      img: <img src="/facebook.png" alt="FaceBook" className="w-5 h-5" />,
    },
    {
      name: "TikTok",
      href: "#",
      img: <img src="/tiktok.png" alt="TikTok" className="w-5 h-5" />,
    },
    {
      name: "YouTube",
      href: "#",
      img: <img src="/youtube.png" alt="YouTube" className="w-5 h-5" />,
    },
    {
      name: "Spotify",
      href: "#",
      img: <img src="/x.png" alt="Spotify" className="w-5 h-5" />,
    },
  ];

  return (
    <div>
      <p className="mb-2 font-semibold text-[15px]">Social media</p>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            aria-label={platform.name}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-light-border text-neutral-black hover:bg-neutral-clacier transition"
          >
            {platform.img}
          </a>
        ))}
      </div>
    </div>
  );
}
