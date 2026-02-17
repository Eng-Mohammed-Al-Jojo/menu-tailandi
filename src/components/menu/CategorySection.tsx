import ItemRow from "./ItemRow";
import type { Category, Item } from "./Menu";

interface Props {
  category: Category;
  items: Item[];
  orderSystem: boolean;
}

export default function CategorySection({ category, items, orderSystem }: Props) {
  return (
    <section className="w-full px-4 md:px-0 py-8 flex flex-col">

      {/* ===== Category Title ===== */}
      <div className="flex justify-center mb-10">
        <div
          className="
            relative
            w-full max-w-full  /* أعرض ما يمكن مع تحديد حد أقصى */
            px-10 py-4
            rounded-2xl
            bg-[#60340e]
            shadow-[0_10px_30px_rgba(96,52,14,0.45)]
          "
        >
          {/* زخرفة الكورنرات */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#F5F5DC] rotate-45" />
          <span className="absolute bottom-2 left-2 w-2 h-2 bg-[#F5F5DC] rotate-45" />

          <h2
            className="
              font-[Cairo]
              font-black
              text-[#F5F5DC]
              text-lg md:text-3xl
              tracking-widest
              text-center
            "
          >
            {category.name}
          </h2>
        </div>
      </div>

      {/* ===== Items ===== */}
      <div className="flex flex-col gap-2 w-full max-w-full mx-auto">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            orderSystem={orderSystem}
          />
        ))}
      </div>
    </section>
  );
}

