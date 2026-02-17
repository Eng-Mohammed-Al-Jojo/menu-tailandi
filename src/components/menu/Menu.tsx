import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import CategorySection from "./CategorySection";



/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  available?: boolean;
  order?: number;
  createdAt?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  priceTw?: number;
  categoryId: string;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
}

/* ================= LocalStorage ================= */
const saveToLocal = (cats: Category[], its: Item[], orderSystem: boolean) => {
  localStorage.setItem(
    "menu_cache",
    JSON.stringify({
      categories: cats,
      items: its,
      orderSystem,
      savedAt: Date.now(),
    })
  );
};

const loadFromLocal = () => {
  const cached = localStorage.getItem("menu_cache");
  if (!cached) return null;
  return JSON.parse(cached);
};

/* ================= Main Component ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
}

export default function Menu({ onLoadingChange, onFeaturedCheck }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSystem, setOrderSystem] = useState<boolean>(true);

  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);

  /* ===== Tabs State (إضافة ضرورية) ===== */
  const [activeCatId, setActiveCatId] = useState<string | null>("all");

  /* ================= Load Backup JSON ================= */
  const loadMenuJson = async () => {
    try {
      const res = await fetch("/menu.json");
      const data = await res.json();

      const cats: Category[] = Object.entries(data.categories || {}).map(
        ([id, v]: any) => ({
          id,
          name: v.name,
          available: v.available !== false,
          order: v.order ?? 0,
          createdAt: v.createdAt || 0,
        })
      ).sort((a, b) => a.order - b.order);

      const its: Item[] = Object.entries(data.items || {}).map(
        ([id, v]: any) => ({
          id,
          ...v,
          createdAt: v.createdAt || 0,
        })
      );

      setCategories(cats);
      setItems(its);
      setOrderSystem(data.orderSystem ?? true);
      setLoading(false);
      onLoadingChange?.(false);

      setToast({ message: "تم تحميل نسخة احتياطية", color: "red" });
      setTimeout(() => setToast(null), 4000);
    } catch {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  /* ================= useEffect ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;
    const startTime = Date.now(); // بداية العد لللودنج

    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);

      const minLoadingTime = 5000; // 5 ثواني
      const elapsed = Date.now() - startTime;

      const hideLoading = () => {
        setLoading(false);
        onLoadingChange?.(false);
        if (timeoutId) clearTimeout(timeoutId);

        setToast({ message: "تم التحميل من قاعدة البيانات", color: "green" });
        setTimeout(() => setToast(null), 3000);
      };

      if (elapsed >= minLoadingTime) {
        hideLoading();
      } else {
        timeoutId = window.setTimeout(hideLoading, minLoadingTime - elapsed);
      }
    };

    const loadOnline = () => {
      let cats: Category[] = [];
      let its: Item[] = [];
      let catsLoaded = false;
      let itemsLoaded = false;
      let orderSystemLoaded = false;

      // Fallback لو الإنترنت ضعيف
      timeoutId = window.setTimeout(() => {
        if (firebaseLoaded) return;
        const cached = loadFromLocal();
        if (cached) {
          setCategories(cached.categories || []);
          setItems(cached.items || []);
          setOrderSystem(cached.orderSystem ?? true);
          setLoading(false);
          onLoadingChange?.(false);

          setToast({
            message: "الإنترنت ضعيف، تم تحميل آخر نسخة محفوظة",
            color: "red",
          });
          setTimeout(() => setToast(null), 4000);
        } else {
          loadMenuJson();
        }
      }, 8000);

      onValue(ref(db, "categories"), (snap) => {
        const data = snap.val();
        cats = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            name: v.name,
            available: v.available !== false,
            order: v.order ?? 0,
            createdAt: v.createdAt || 0,
          }))
          : [];
        cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCategories(cats);
        catsLoaded = true;
        if (itemsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "items"), (snap) => {
        const data = snap.val();
        its = data
          ? Object.entries(data).map(([id, v]: any) => ({
            id,
            ...v,
            createdAt: v.createdAt || 0,
          }))
          : [];
        setItems(its);
        itemsLoaded = true;
        if (catsLoaded && orderSystemLoaded) finishFirebase(cats, its, orderSystem);
      });

      onValue(ref(db, "settings/orderSystem"), (snap) => {
        const val = snap.val();
        setOrderSystem(val ?? true);
        orderSystemLoaded = true;
        if (catsLoaded && itemsLoaded) finishFirebase(cats, its, val ?? true);
      });
    };

    if (navigator.onLine) loadOnline();
    else loadMenuJson();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onLoadingChange]);

  /* ================= Check Featured Items ================= */
  useEffect(() => {
    const hasFeatured = items.some((item) => item.star === true);
    onFeaturedCheck?.(hasFeatured);
  }, [items, onFeaturedCheck]);

  /* ================= Available Categories ================= */
  const availableCategories = categories.filter((cat) => cat.available);

  /* ===== تحديد أول Tab تلقائيًا (إضافة مهمة) ===== */
  useEffect(() => {
    if (!activeCatId && availableCategories.length && items.length) {
      const firstCat = availableCategories.find(cat =>
        items.some(i => i.categoryId === cat.id)
      );
      if (firstCat) setActiveCatId(firstCat.id);
    }
  }, [availableCategories, items, activeCatId]);

  /* ========= Loading UI ========= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center ">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />

        <div className="relative z-10 flex flex-col items-center px-12 py-14 rounded-[3rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_80px_rgba(253,177,67,0.25)]">
          <div className="absolute -inset-8 rounded-[4rem] bg-[#FDB143]/10 blur-3xl animate-pulse" />

          <div className="relative w-48 h-48 mb-10">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full shadow-2xl animate-floatSlow"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-widest text-[#F7F3E8]">
            مطعم التايلندي
          </h2>

          <div className="w-24 h-[2px] bg-[#60340e]/70 rounded-full my-5" />

          <p className="text-[#F7F3E8]/70 text-lg font-[Cairo] text-center">
            نكهات تعود .. ذكريات تتجدد
          </p>
        </div>
      </div>
    );
  }


  /* ================= Render ================= */
  return (
    <main className="max-w-4xl mx-auto px-0 pb-10 font-[Cairo] font-light text-[#F5F8F7]">
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-2xl font-bold shadow-2xl z-50 text-white
          ${toast.color === "green" ? "bg-[#60340e]" : "bg-[#60340e]"}`}
        >
          {toast.message}
        </div>
      )}

      {/* ===== Tabs الأقسام ===== */}
      <div className="top-0 z-30 bg-inherit py-2">
        <div className="flex gap-2 sm:gap-3 px-3 items-center justify-center flex-wrap">

          {/* زر عرض الكل */}
          <button
            onClick={() => setActiveCatId("all")}
            className={`
        px-3 sm:px-4
        py-1.5 sm:py-2
        rounded-full whitespace-nowrap
        font-semibold
        text-xs sm:text-sm md:text-base
        border transition-all duration-200 ease-out
        ${activeCatId === "all"
                ? "bg-[#60340e] text-white border-[#60340e] shadow-sm "
                : "bg-transparent text-[#60340e] border-[#60340e]/70 hover:bg-[#60340e]/10"}
      `}
          >
            الكل
          </button>

          {/* بقية التابس */}
          {availableCategories.map((cat) => {
            const hasItems = items.some((i) => i.categoryId === cat.id);
            if (!hasItems) return null;

            const isActive = activeCatId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`
            px-3 sm:px-4
            py-1.5 sm:py-2
            rounded-full whitespace-nowrap
            font-semibold
            text-xs sm:text-sm md:text-base
            border transition-all duration-200 ease-out
            ${isActive
                    ? "bg-[#60340e] text-white border-[#60340e] shadow-sm"
                    : "bg-transparent text-[#60340e] border-[#60340e]/70 hover:bg-[#60340e]/10"}
          `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Separator فخم ===== */}
      <div className="flex items-center justify-center my-8">

        {/* خط  */}
        <span className="flex-1 h-1 bg-[#60340e]/40 rounded-full"></span>


      </div>

      {/* ===== محتوى القسم / عرض الكل ===== */}
      <div className="min-h-screen">
        {activeCatId === "all"
          ? availableCategories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                items={catItems}
                orderSystem={orderSystem}
              />
            );
          })
          : availableCategories.map((cat) => {
            if (cat.id !== activeCatId) return null;

            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (!catItems.length) return null;

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                items={catItems}
                orderSystem={orderSystem}
              />
            );
          })}
      </div>


    </main>
  );
}
