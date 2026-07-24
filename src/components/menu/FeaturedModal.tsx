import { useEffect, useState } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";

interface Props {
  show: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  star?: boolean;
  visible?: boolean;
}

export default function FeaturedModal({ show, onClose }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;

    const fetchStarItems = async () => {
      try {
        const snap = await get(ref(db, "items"));
        if (snap.exists()) {
          const data = snap.val();
          const starItems = Object.entries(data)
            .map(([id, item]: any) => ({ id, ...item }))
            .filter((item) => item.star === true && item.visible !== false);
          setItems(starItems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStarItems();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Container — Clean Surface Card */}
      <div className="relative w-full max-w-2xl bg-[#FDF8EE] rounded-2xl p-5 md:p-8 elevation-5 border border-[#60340e]/15 overflow-hidden animate-modal-enter z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#60340e]/70 hover:text-[#60340e] hover:bg-[#60340e]/10 rounded-full transition-all duration-200"
          aria-label="إغلاق"
        >
          <FaTimes size={20} />
        </button>

        {/* Title Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <FaStar className="text-[#C9A84C] w-5 h-5 animate-pulse" />
          <h2 className="text-center text-xl md:text-2xl font-bold text-[#60340e] tracking-wide">
            الأصناف الأكثر طلباً
          </h2>
          <FaStar className="text-[#C9A84C] w-5 h-5 animate-pulse" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-3 border-[#60340e]/20 border-t-[#60340e] rounded-full animate-spin" />
            <p className="text-[#60340e]/70 text-sm font-[Cairo]">جاري تحميل المميز...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-[#60340e]/60 text-base font-[Cairo]">
            لا يوجد أصناف مميزة حالياً
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide gap-4 md:gap-6 py-2 px-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="shrink-0 snap-center w-60 md:w-68 bg-[#FDFAF3] border border-[#60340e]/15 rounded-xl p-4 elevation-2 hover:elevation-3 transition-all duration-200 flex flex-col items-center text-center"
              >
                {/* Image Frame with Ring Accent */}
                <div className="relative w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden bg-[#F7F3E8] ring-2 ring-[#C9A84C]/40 shadow-md mb-4 flex items-center justify-center shrink-0">
                  <img
                    src={item.image ? `/images/${item.image}` : `/logo.png`}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col grow justify-between w-full">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-[#60340e] mb-1.5 line-clamp-1">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="text-xs md:text-sm text-[#60340e]/70 font-light mb-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#60340e]/10 flex items-center justify-center">
                    <span className="px-3 py-1 bg-[#60340e] text-[#F7F3E8] rounded-md text-sm md:text-base font-bold shadow-xs">
                      {item.price}₪
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-[#60340e]/60 mt-4 font-[Cairo]">
          اسحب يمين أو يسار للتنقل بين الأصناف
        </p>
      </div>
    </div>
  );
}
