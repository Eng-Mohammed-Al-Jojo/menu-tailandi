import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaStar } from "react-icons/fa";
import type { Item } from "./Menu";

interface Props {
  item: Item;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: Props) {
  const prices = String(item.price)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const unavailable = item.visible === false;
  const imgSrc = item.image ? `/images/${item.image}` : "/logo.png";

  /* ===== إغلاق بزر Escape + منع تمرير الخلفية ===== */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#FDF8EE] rounded-2xl overflow-hidden elevation-5 border border-[#60340e]/15 animate-modal-enter">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 active:scale-95 transition-all duration-200"
        >
          <FaTimes size={16} />
        </button>

        {/* Image Hero */}
        <div className="relative h-60 md:h-72 bg-[#F7F3E8]">
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          {/* تدرج سفلي لدمج الصورة مع المحتوى */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D1F07]/55 via-transparent to-transparent pointer-events-none" />

          {/* شارة الأكثر طلباً */}
          {item.star && (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#C9A84C] text-[#3D1F07] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <FaStar size={12} />
              الأكثر طلباً
            </span>
          )}

          {/* شارة غير متوفر */}
          {unavailable && (
            <span className="absolute bottom-3 right-3 bg-black/55 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              غير متوفر حالياً
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-5 md:px-6 pt-5 pb-6 text-center font-[Cairo]">
          <h3 className="text-lg md:text-xl font-bold text-[#60340e] leading-snug">
            {item.name}
          </h3>

          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-3 rounded-full" />

          {item.ingredients && (
            <p className="text-xs md:text-[13px] font-light text-[#60340e]/75 leading-relaxed">
              {item.ingredients}
            </p>
          )}

          {/* Prices */}
          {prices.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-[#60340e]/10">
              {prices.map((p, i) => (
                <span
                  key={i}
                  className="px-5 py-1.5 rounded-lg bg-[#60340e] border border-[#C9A84C]/30 text-[#F7F3E8] text-sm md:text-[15px] font-bold tracking-wide shadow-xs"
                >
                  {p}₪
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
