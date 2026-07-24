import React from "react";
import { FiX, FiCheck } from "react-icons/fi";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (img: string) => void;
  galleryImages: string[];
  selectedImage?: string;
}

const FeaturedGallery: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
  galleryImages,
  selectedImage,
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-[#FDFAF5] rounded-2xl w-full max-w-lg border border-[#60340e]/20 admin-shadow-modal animate-modal-enter overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#60340e]/10 bg-white">
          <h3 className="font-bold text-base text-[#60340e]">اختر صورة مصغرة للصنف</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#60340e]/60 hover:text-[#60340e] hover:bg-[#60340e]/10 rounded-full transition"
            aria-label="إغلاق"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Grid Body */}
        <div className="p-5 max-h-80 overflow-y-auto">
          {galleryImages.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#60340e]/60 font-medium">
              لا توجد صور في المجلد حالياً
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {galleryImages.map((img) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => onSelect(img)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square
                      ${
                        isSelected
                          ? "border-[#60340e] ring-2 ring-[#60340e]/30"
                          : "border-transparent hover:border-[#60340e]/40"
                      }`}
                  >
                    <img
                      src={`/images/${img}`}
                      alt={img}
                      className="w-full h-full object-contain bg-[#FAF6ED]"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#60340e]/30 flex items-center justify-center">
                        <FiCheck className="text-white w-7 h-7 drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#60340e]/10 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-sm border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition"
          >
            إغلاق بدون تغيير
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGallery;
