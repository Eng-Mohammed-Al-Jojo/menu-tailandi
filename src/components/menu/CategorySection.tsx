import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full px-2 md:px-0 py-8 flex flex-col animate-category-enter">
      {/* ===== Category Header ===== */}
      <div className="flex justify-center mb-8">
        <div
          className="
            relative
            w-full max-w-full
            px-8 py-3.5 md:py-4
            rounded-xl
            bg-[#60340e]
            elevation-3
            border border-[#C9A84C]/30
            overflow-hidden
          "
        >
          {/* زخرفة الكورنرات الذهبية الناعمة */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C9A84C] rotate-45 opacity-80" />
          <span className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#C9A84C] rotate-45 opacity-80" />

          <h2
            className="
              font-[Cairo]
              font-bold
              text-[#F7F3E8]
              text-lg md:text-2xl
              tracking-wider
              text-center
            "
          >
            {category.name}
          </h2>
        </div>
      </div>

      {/* ===== Items with Spacing & Staggered Animation ===== */}
      <div className="flex flex-col gap-3 md:gap-4 w-full max-w-full mx-auto">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            orderSystem={orderSystem}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
