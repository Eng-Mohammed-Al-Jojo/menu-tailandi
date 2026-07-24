import { useEffect, useState, useRef } from "react";
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
  ingredients: any;
  id: string;
  name: string;
  price: number;
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

  const [toast, setToast] = useState<{ message: string; color: "green" | "amber" | "red" } | null>(null);

  /* ===== Tabs State & Auto-centering Refs ===== */
  const [activeCatId, setActiveCatId] = useState<string | null>("all");
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  /* ===== Smart Sticky Tab Bar State ===== */
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // الالتصاق يبدأ بعد التمرير لمسافة 180px
      if (window.scrollY > 180) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===== Auto-Center Active Tab into View ===== */
  useEffect(() => {
    if (activeCatId && tabRefs.current[activeCatId]) {
      tabRefs.current[activeCatId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCatId]);

  /* ================= Load Backup JSON ================= */
  const loadMenuJson = async () => {
    try {
      const res = await fetch("/menu.json");
      const data = await res.json();

      /* ===== Categories ===== */
      const cats: Category[] = Object.entries(data.categories || {})
        .map(([id, v]: any) => ({
          id,
          name: v.name || "",
          available: v.available !== false,
          order: v.order ?? 0,
          createdAt: v.createdAt || 0,
        }))
        .sort((a, b) => a.order - b.order);

      /* ===== Items ===== */
      const its: Item[] = Object.entries(data.items || {}).map(
        ([id, v]: any) => ({
          id,
          name: v.name || "",
          price: parseFloat((v.price || "").toString().trim()) || 0,
          categoryId: v.categoryId || "",
          subcategoryId: v.subcategoryId || "",
          available: v.visible !== false,
          image: v.image || "",
          ingredients: v.ingredients || "",
          star: v.star || false,
          featured: v.featured || false,
          createdAt: v.createdAt || 0,
        })
      );

      /* ===== Apply State ===== */
      setCategories(cats);
      setItems(its);
      setOrderSystem(data.orderSystem ?? true);

      setLoading(false);
      onLoadingChange?.(false);

      setToast({ message: "تم تحميل النسخة الاحتياطية", color: "amber" });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error("Load JSON Error:", err);
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  /* ================= useEffect Firebase ================= */
  useEffect(() => {
    onLoadingChange?.(true);

    let timeoutId: number | null = null;
    let firebaseLoaded = false;
    const startTime = Date.now();

    const finishFirebase = (cats: Category[], its: Item[], os: boolean) => {
      firebaseLoaded = true;
      saveToLocal(cats, its, os);

      const minLoadingTime = 2000;
      const elapsed = Date.now() - startTime;

      const hideLoading = () => {
        setLoading(false);
        onLoadingChange?.(false);
        if (timeoutId) clearTimeout(timeoutId);

        setToast({ message: "تم التحميل بنجاح", color: "green" });
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
            message: "الإنترنت ضعيف، تم تحميل البيانات المحفوظة",
            color: "amber",
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
            name: v.name || "",
            price: parseFloat((v.price || "").toString().trim()) || v.price,
            categoryId: v.categoryId || "",
            subcategoryId: v.subcategoryId || "",
            available: v.visible !== false,
            image: v.image || "",
            ingredients: v.ingredients || "",
            star: v.star || false,
            featured: v.featured ?? v.star ?? false,
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

  /* ===== تحديد أول Tab تلقائيًا ===== */
  useEffect(() => {
    if (!activeCatId && availableCategories.length && items.length) {
      const firstCat = availableCategories.find((cat) =>
        items.some((i) => i.categoryId === cat.id)
      );
      if (firstCat) setActiveCatId(firstCat.id);
    }
  }, [availableCategories, items, activeCatId]);

  /* ========= Premium Loading Screen UI ========= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[#F7F3E8] backdrop-blur-xl" />

        <div className="relative z-10 flex flex-col items-center px-10 py-12 md:px-14 md:py-14 rounded-3xl bg-white/40 backdrop-blur-xl border border-[#60340e]/10 shadow-[0_20px_60px_rgba(96,52,14,0.15)] animate-loader-fade">
          <div className="absolute -inset-8 rounded-[4rem] bg-[#C9A84C]/10 blur-3xl animate-pulse" />

          <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full drop-shadow-xl animate-floatSlow"
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider text-[#60340e]">
            مطعم التايلندي
          </h2>

          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent my-4" />

          <p className="text-[#60340e]/80 text-base md:text-lg font-[Cairo] text-center">
            نكهات تعود .. ذكريات تتجدد
          </p>
        </div>
      </div>
    );
  }

  /* ================= Render ================= */
  return (
    <main className="max-w-4xl mx-auto px-0 pb-12 font-[Cairo] font-normal text-[#3D1F07]">
      {/* ===== Toast Distinction ===== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-2xl font-bold shadow-2xl z-40 text-white transition-all duration-300 animate-toast-show flex items-center gap-2 ${toast.color === "green"
            ? "bg-[#2D6A4F]"
            : toast.color === "amber"
              ? "bg-[#B45309]"
              : "bg-[#9B1C1C]"
            }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* ===== Seamless Sticky Tab Bar Container (No Borders, Seamless Screen Blend) ===== */}
      <div
        className={`sticky-tabs-container top-0 z-20 w-full py-2.5 px-0 ${isSticky ? "sticky is-sticky" : "bg-transparent"
          }`}
      >
        <div className="max-w-3xl mx-auto relative px-2">
          {/*
            Mobile (< md): horizontal scroll carousel with edge-fade mask
            Desktop (>= md): flex-wrap centered — no scroll, no clipping
          */}
          <div className="
            md:flex md:flex-wrap md:justify-center md:gap-2.5 md:py-1 md:px-3
            max-md:scroll-mask-x max-md:flex max-md:items-center max-md:gap-2 max-md:overflow-x-auto max-md:scrollbar-hide max-md:py-1 max-md:px-3 max-md:snap-x max-md:scroll-smooth
          ">
            {/* زر عرض الكل */}
            <button
              ref={(el) => { tabRefs.current["all"] = el; }}
              onClick={() => setActiveCatId("all")}
              className={`
                shrink-0 snap-center
                px-4 py-2 sm:px-5 sm:py-2.5
                rounded-full whitespace-nowrap
                font-medium text-xs sm:text-sm
                transition-all duration-300 ease-out
                flex items-center gap-1.5
                ${activeCatId === "all"
                  ? "bg-[#60340e] text-[#F7F3E8] font-bold shadow-[0_4px_16px_rgba(96,52,14,0.22)] scale-[1.02]"
                  : "bg-white/60 text-[#60340e]/80 border border-[#60340e]/10 hover:bg-white/90 hover:text-[#60340e] hover:border-[#60340e]/20 active:scale-95"
                }
              `}
            >
              {activeCatId === "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
              )}
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
                  ref={(el) => { tabRefs.current[cat.id] = el; }}
                  onClick={() => setActiveCatId(cat.id)}
                  className={`
                    shrink-0 snap-center
                    px-4 py-2 sm:px-5 sm:py-2.5
                    rounded-full whitespace-nowrap
                    text-xs sm:text-sm
                    transition-all duration-300 ease-out
                    flex items-center gap-1.5
                    ${isActive
                      ? "bg-[#60340e] text-[#F7F3E8] font-bold shadow-[0_4px_16px_rgba(96,52,14,0.22)] scale-[1.02]"
                      : "bg-white/60 text-[#60340e]/90 border-1 border-[#60340e]/50 hover:bg-white/90 hover:text-[#60340e] hover:border-1 border-[#60340e]/70 active:scale-95"
                    }
                  `}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Separator فاخر مع نقطة ذهبية ===== */}
      <div className="flex items-center justify-center my-6 px-4 max-w-lg mx-auto">
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#60340e]/35 to-transparent" />
        <span className="mx-3 w-1.5 h-1.5 rotate-45 bg-[#C9A84C] shadow-[0_0_6px_rgba(201,168,76,0.5)] shrink-0" />
        <span className="flex-1 h-px bg-gradient-to-l from-transparent via-[#60340e]/35 to-transparent" />
      </div>

      {/* ===== محتوى القسم / عرض الكل مع أنيميشن ناعم ===== */}
      <div key={activeCatId || "all"} className="min-h-[60vh] animate-tab-content">
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
