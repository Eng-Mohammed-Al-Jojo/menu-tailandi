import { type Item } from "./Menu";

interface Props {
  item: Item;
  orderSystem: boolean;
  index?: number;
}

export default function ItemRow({ item, orderSystem, index = 0 }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;
  const hasIngredients = !!item.ingredients;

  // حساب التاخير الزمني للانيميشن المتتابع (Staggered Animation)
  const animDelay = Math.min(index * 45, 350);

  return (
    <div
      style={{ animationDelay: `${animDelay}ms` }}
      className={`
        relative
        rounded-xl
        p-3.5 md:p-4.5
        bg-[#FDFAF3]
        border border-[#60340e]/15
        elevation-2
        hover:elevation-3
        transition-all duration-200 ease-out
        animate-item-enter
        ${unavailable ? "opacity-50" : "hover:-translate-y-0.5"}
      `}
    >
      {/* ===== Card Side Accent ===== */}
      <span className="absolute top-3 bottom-3 right-1.5 w-1 bg-[#60340e]/70 rounded-full" />

      <div className="flex items-center justify-between gap-4 md:gap-6">
        {/* ===== Right Side: Name + Ingredients ===== */}
        <div className="flex flex-col gap-1 md:gap-1.5 flex-1 text-right pr-3">
          <h3
            className={`
              font-[Cairo]
              text-base md:text-lg
              font-semibold
              text-[#60340e]
              leading-snug
              ${unavailable ? "line-through text-gray-400" : ""}
            `}
          >
            {item.name}
          </h3>

          {hasIngredients && (
            <p
              className={`
                text-xs md:text-sm
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

        {/* ===== Left Side: Price Box (Balanced Typography) ===== */}
        <div className="flex items-center justify-center shrink-0 min-w-[85px] md:min-w-[100px] px-1 md:px-2 pr-10">
          {!orderSystem && (
            <div
              className="
                px-3 py-1.5
                rounded-md
                bg-[#60340e]
                border border-[#C9A84C]/20
                shadow-xs
                flex items-center justify-center
              "
            >
              <span
                className={`
                  text-sm md:text-base
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
  );
}
