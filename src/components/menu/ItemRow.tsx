import { type Item } from "./Menu";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { FaCheck } from "react-icons/fa";

interface Props {
  item: Item;
  orderSystem: boolean;
}

export default function ItemRow({ item, orderSystem }: Props) {
  const prices = String(item.price).split(",");
  const unavailable = item.visible === false;

  const { addItem } = useCart();
  const [addedPrice, setAddedPrice] = useState<number | null>(null);

  const hasIngredients = !!item.ingredients;

  const handleAdd = (price: number) => {
    addItem(item, price);
    setAddedPrice(price);
    setTimeout(() => setAddedPrice(null), 1200);
  };

  return (
    <div
      className={`
        relative
        rounded-2xl
        p-4 md:p-5
        bg-[#F5F5DC]
        border border-[#60340e]/40
        shadow-[0_12px_35px_rgba(96,52,14,0.25)]
        transition-all duration-300
        ${unavailable ? "opacity-50" : "hover:-translate-y-1"}
      `}
    >
      {/* ===== Card Decoration (Side Accent) ===== */}
      <span className="absolute top-4 bottom-4 right-2 w-[3px] bg-[#60340e]/60 rounded-full" />

      <div className="flex items-center justify-between gap-6">

        {/* ===== Right Side: Name + Ingredients ===== */}
        <div className="flex flex-col gap-2 flex-1 text-right pr-4">
          <h3
            className={`
              font-[Cairo]
              text-lg md:text-xl
              font-bold
              text-[#60340e]
              ${unavailable ? "line-through text-gray-400" : ""}
            `}
          >
            {item.name}
          </h3>

          {hasIngredients && (
            <p
              className={`
                text-sm md:text-base
                text-[#60340e]/70
                leading-relaxed
                ${unavailable ? "line-through text-gray-400" : ""}
              `}
            >
              {item.ingredients}
            </p>
          )}
        </div>

        {/* ===== Left Side: PRICE BOX (No Decoration) ===== */}
        <div className="flex items-center justify-center min-w-[110px]">

          {/* --- No Order System --- */}
          {!orderSystem && (
            <div
              className="
                px-5 py-3
                rounded-xl
                bg-[#60340e]
                shadow-[0_6px_18px_rgba(96,52,14,0.45)]
              "
            >
              <span
                className={`
                  text-lg md:text-xl
                  font-black
                  font-[Alamiri]
                  text-[#F5F5DC]
                  tracking-wide
                  ${unavailable ? "line-through" : ""}
                `}
              >
                {prices.map((p) => p.trim() + "₪").join(" | ")}
              </span>
            </div>
          )}

          {/* --- Order System --- */}
          {orderSystem && (
            <div className="flex flex-col gap-2 w-full">
              {prices.map((p) => {
                const price = Number(p.trim());
                const isAdded = addedPrice === price;

                return (
                  <button
                    key={price}
                    onClick={() => handleAdd(price)}
                    disabled={unavailable}
                    className={`
                      w-full
                      px-4 py-2
                      rounded-xl
                      border border-[#60340e]
                      font-bold
                      transition-all
                      ${isAdded
                        ? "bg-[#60340e] text-[#F5F5DC]"
                        : "bg-[#F5F5DC] text-[#60340e] hover:bg-[#60340e]/10"}
                    `}
                  >
                    {isAdded ? <FaCheck /> : `${price}₪`}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
