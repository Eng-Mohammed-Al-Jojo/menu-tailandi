import { useState } from "react";
import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";
import Slogan from "../components/menu/Slogan";
import { FaFire } from "react-icons/fa";
import FeaturedModal from "../components/menu/FeaturedModal";

export default function MenuPage() {
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFeatured, setHasFeatured] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-[#F7F3E8] text-[#3D1F07] font-[Cairo] selection:bg-[#60340e]/20 selection:text-[#60340e]"
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Hero — Logo مع خطوط تباين راقية + سلوجان */}
        <header className="flex flex-col items-center justify-center w-full pt-6 md:pt-8 pb-4 md:pb-5 px-3 max-w-5xl mx-auto">
          <div className="flex items-center justify-center w-full">
            {/* خط يسار رفيع متلاشٍ */}
            <div className="grow h-[2px] bg-gradient-to-r from-transparent via-[#60340e]/40 to-[#60340e]/15 rounded-full" />

            {/* اللوجو — حجم أصغر قليلاً */}
            <img
              src="/logo.png"
              alt="مطعم التايلندي"
              className="
                mx-4 md:mx-8
                w-32 md:w-40
                object-contain
                drop-shadow-[0_8px_24px_rgba(96,52,14,0.25)]
                animate-logo-float
                z-10
              "
            />

            {/* خط يمين رفيع متلاشٍ */}
            <div className="grow h-[2px] bg-gradient-to-l from-transparent via-[#60340e]/40 to-[#60340e]/15 rounded-full" />
          </div>

          {/* السلوجان الفخم أسفل اللوجو */}
          <div className="mt-2.5 md:mt-3">
            <Slogan />
          </div>
        </header>

        {/* Main Menu Component — بادنج جانبي مخفف */}
        <div className="flex-1 w-full px-2.5 md:px-5">
          <Menu
            onLoadingChange={setLoading}
            onFeaturedCheck={setHasFeatured}
          />
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Featured Floating Button — يظهر فقط بعد انتهاء التحميل ووجود صنف مميز */}
      {!loading && hasFeatured && (
        <div className="fixed top-4 left-4 z-30 flex flex-col items-center">
          <button
            onClick={() => setShowFeaturedModal(true)}
            className="
              group flex flex-col items-center justify-center
              w-14 h-14 md:w-16 md:h-16
              bg-gradient-to-br from-[#60340e] via-[#7A4218] to-[#60340e]
              text-white font-bold rounded-2xl
              elevation-4
              hover:scale-105 active:scale-95
              transition-all duration-300
              border border-[#C9A84C]/40
            "
            title="الأكثر طلباً"
          >
            <FaFire className="w-5 h-5 md:w-6 md:h-6 text-[#C9A84C] group-hover:scale-110 transition-transform duration-300 animate-pulse" />
            <span className="text-[10px] mt-0.5 font-medium text-[#F7F3E8]">المميز</span>
          </button>
        </div>
      )}

      {/* Featured Modal */}
      <FeaturedModal
        show={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
      />
    </div>
  );
}
