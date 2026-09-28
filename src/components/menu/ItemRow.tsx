import { useState } from "react";
import { type Item } from "./Menu";
import ItemModal from "./ItemModal";

interface Props {
  item: Item;
  orderSystem: boolean;
  index?: number;
}

export default function ItemRow({ item, orderSystem, index = 0 }: Props) {
  const [showModal, setShowModal] = useState(false);
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;
  const hasIngredients = !!item.ingredients;
  // الصورة الخاصة بالصنف — الافتراضية هي اللوجو
  const imgSrc = item.image ? `/images/${item.image}` : "/logo.png";

  // حساب التاخير الزمني للانيميشن المتتابع (Staggered Animation)
  const animDelay = Math.min(index * 45, 350);

  return (
    <>
    <div
      style={{ animationDelay: `${animDelay}ms` }}
      onClick={() => setShowModal(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setShowModal(true);
      }}
      tabIndex={0}
      role="button"
      aria-label={`عرض تفاصيل ${item.name}`}
      className={`
        relative
        group
        cursor-pointer
        rounded-xl
        p-2.5 md:p-3
        bg-[#FDFAF3]
        border border-[#60340e]/15
        elevation-2
        hover:elevation-3 hover:border-[#C9A84C]/50
        transition-all duration-200 ease-out
        animate-item-enter
        focus-visible:outline-2 focus-visible:outline-[#60340e]/50 focus-visible:outline-offset-2
        ${unavailable ? "opacity-50" : "hover:-translate-y-0.5"}
      `}
    >
      {/* ===== Card Side Accent — مخفي خلف الصورة لتجنب التزاحم ===== */}

      <div className="flex items-stretch justify-between gap-2 md:gap-3">
        {/* ===== Right Side: Item Image (يمين الكارد) — حجم أكبر ===== */}
        <div className="shrink-0 relative self-center">
          <div
            className="
              w-20 h-20 md:w-24 md:h-24
              rounded-xl overflow-hidden
              bg-[#F7F3E8]
              border border-[#C9A84C]/40
              shadow-[0_2px_10px_rgba(96,52,14,0.12)]
              flex items-center justify-center
            "
          >
            <img
              src={imgSrc}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
          {/* لمسة مميزة: نقطة ذهبية صغيرة */}
          <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#C9A84C] border-2 border-[#FDFAF3] shadow-xs" />
        </div>

        {/* ===== Middle: Name + Ingredients ===== */}
        <div className="flex flex-col justify-center gap-0.5 flex-1 text-right min-w-0">
          <h3
            className={`
              font-[Cairo]
              text-sm md:text-[15px]
              font-semibold
              text-[#60340e]
              leading-relaxed
              ${unavailable ? "line-through text-gray-400" : ""}
            `}
          >
            {item.name}
          </h3>

          {hasIngredients && (
            <p
              className={`
                text-[11px] md:text-xs
                font-[Cairo]
                font-light
                text-[#60340e]/70
                leading-relaxed
                ${unavailable ? "line-through text-gray-400" : ""}
              `}
            >
              {item.ingredients}
            </p>
          )}
        </div>

        {/* ===== Left Side: Price Box — أقصى اليسار، خط صغير متجاوب ===== */}
        <div className="flex flex-col items-end justify-start shrink-0 pt-0.5">
          {!orderSystem && (
            <div
              className="
                px-1.5 py-0.5 md:px-2 md:py-1
                rounded-md
                bg-[#60340e]
                border border-[#C9A84C]/20
                shadow-xs
                flex items-center justify-center
                whitespace-nowrap
              "
            >
              <span
                className={`
                  text-[11px] sm:text-xs md:text-sm
                  font-bold
                  font-[Cairo]
                  text-[#F7F3E8]
                  tracking-wide
                  ${unavailable ? "line-through opacity-60" : ""}
                `}
              >
                {prices.map((p) => p.trim() + "₪").join(" | ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ===== Item Details Modal ===== */}
      {showModal && (
        <ItemModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
