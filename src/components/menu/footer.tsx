import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
  FaCommentDots,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import FeedbackModal from "../menu/FeedbackModal";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");

  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    telegram: "",
  });

  const normalizeUrl = (url?: string) => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  useEffect(() => {
    /* ===== footerInfo ===== */
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) setFooter(JSON.parse(localData));

    const footerRef = ref(db, "settings/footerInfo");
    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooter(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    });

    /* ===== complaintsWhatsapp ===== */
    const complaintsRef = ref(db, "settings/complaintsWhatsapp");
    const unsubComplaints = onValue(complaintsRef, (snapshot) => {
      const value = snapshot.val();
      setComplaintsWhatsapp(value ? String(value).trim() : "");
    });

    return () => {
      unsubFooter();
      unsubComplaints();
    };
  }, []);

  /* ===== Social Icons ===== */
  const socialIcons: { Icon: any; url: string | undefined }[] = [
    {
      Icon: FaWhatsapp,
      url: footer.whatsapp ? `https://wa.me/${footer.whatsapp}` : undefined,
    },
    { Icon: FaInstagram, url: normalizeUrl(footer.instagram) },
    { Icon: FaFacebookF, url: normalizeUrl(footer.facebook) },
    { Icon: FaTiktok, url: normalizeUrl(footer.tiktok) },
    { Icon: FaTelegramPlane, url: normalizeUrl(footer.telegram) },
  ];

  return (
    <footer
      className="
        mt-16 md:mt-20
        bg-[#60340e]
        text-[#F7F3E8]
        rounded-t-3xl
        border-t border-[#C9A84C]/30
        elevation-4
        font-[Almarai]
        relative
      "
    >
      {/* Top Accent Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* ===== Right | Address & Phone ===== */}
        <div className="flex flex-col md:items-start items-center space-y-3 w-full md:w-auto text-[#F7F3E8]">
          {footer.address && (
            <div className="flex items-center gap-2.5 text-base md:text-lg font-[Cairo] text-[#F7F3E8]">
              <FaMapMarkerAlt className="text-lg shrink-0 text-[#C9A84C]" />
              <span className="text-center md:text-right text-[#F7F3E8]">{footer.address}</span>
            </div>
          )}

          {footer.phone && (
            <a
              href={`tel:${footer.phone}`}
              className="flex items-center gap-2 text-sm md:text-base font-[Cairo] hover:text-[#C9A84C] transition-colors"
            >
              <FaPhoneAlt className="text-xs text-[#C9A84C]" /> {footer.phone}
            </a>
          )}
        </div>

        {/* ===== Center | Social + Feedback ===== */}
        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
          <div className="flex gap-3">
            {socialIcons.map(
              ({ Icon, url }, i) =>
                url && (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      w-10 h-10 rounded-full flex items-center justify-center
                      bg-[#F7F3E8] text-[#60340e]
                      elevation-2
                      hover:elevation-3
                      hover:scale-110
                      border border-[#C9A84C]/20
                      transition-all duration-200
                    "
                  >
                    <Icon className="text-[#60340e] text-lg" />
                  </a>
                )
            )}
          </div>

          {/* ===== Feedback Button ===== */}
          {complaintsWhatsapp !== "" && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="
                mt-2 w-full max-w-xs flex items-center justify-center gap-2
                bg-[#F7F3E8] text-[#60340e]
                rounded-xl
                py-2.5 px-5
                elevation-2
                hover:elevation-3
                hover:scale-102 active:scale-98
                transition-all duration-200
                border border-[#C9A84C]/30
              "
            >
              <FaCommentDots className="w-5 h-5 text-[#60340e]" />
              <span className="text-sm font-bold font-[Cairo]">أرسل تقييمك</span>
            </button>
          )}
        </div>

        {/* ===== Left | Signature ===== */}
        <div className="flex flex-col md:items-end items-center w-full md:w-auto">
          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F7F3E8]/10 hover:bg-[#F7F3E8]/15 border border-white/10 transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-[#F7F3E8]/20 flex items-center justify-center shrink-0">
              <FaLaptopCode className="text-[#C9A84C] text-base" />
            </div>

            <div className="leading-tight text-center md:text-left">
              <span className="block text-[10px] opacity-75 font-[Lemonada]">
                تصميم وتطوير
              </span>
              <span className="block font-bold text-xs md:text-sm font-[Lemonada] text-[#F7F3E8]">
                Eng. Mohammed Eljoujo
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* ===== Feedback Modal ===== */}
      {complaintsWhatsapp !== "" && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </footer>
  );
}
