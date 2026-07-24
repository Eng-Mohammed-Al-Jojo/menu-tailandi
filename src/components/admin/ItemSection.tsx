import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiBox } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import type { PopupState, Category, Item } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect";

/* ================== Auto load featured images ================== */
const galleryImages = Object.keys(
  import.meta.glob("/public/images/*")
).map((path) => path.replace("/public/images/", ""));

interface Props {
  categories: Record<string, Category>;
  items: Record<string, Item>;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const ItemSection: React.FC<Props> = ({ categories, items, setPopup }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemIngredients, setItemIngredients] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ================== Gallery state ==================
  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");

  // ================== Local state for items ==================
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // ================== Firebase updates ==================
  const addItem = async () => {
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemName.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      name: itemName,
      ingredients: itemIngredients,
      price: itemPrice,
      categoryId: selectedCategory,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "",
      star: false,
    });

    // Reset form
    setItemName("");
    setItemIngredients("");
    setItemPrice("");
    setSelectedCategory("");
    setItemImage("");

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateImage = async (id: string, image: string) => {
    await update(ref(db, `items/${id}`), { image });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateImage(galleryForItemId, img);
    setShowGallery(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#60340e]/15 elevation-1 relative">
      {/* Card Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FiBox className="text-xl text-[#60340e]" />
          <h2 className="font-bold text-lg md:text-xl text-[#60340e]">إدارة وإضافة الأصناف</h2>
        </div>
      </div>

      {/* ================== إضافة صنف جديد (Form Grid) ================== */}
      <div className="bg-[#FAF6ED] p-4 md:p-5 rounded-xl border border-[#60340e]/15 mb-6 space-y-4">
        <h3 className="text-xs font-bold text-[#60340e] tracking-wider">إضافة صنف جديد للقائمة</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* اختيار القسم */}
          <div className="flex flex-col">
            <CustomSelect
              options={Object.keys(categories).map(id => ({ id, name: categories[id].name }))}
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setSelectedCategoryError(false); }}
              error={selectedCategoryError}
              placeholder="اختر القسم *"
            />
            {selectedCategoryError && <span className="text-xs text-rose-600 mt-1 pr-1 font-medium">الرجاء اختيار قسم</span>}
          </div>

          {/* اسم الصنف */}
          <div className="flex flex-col">
            <input
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#2C1A0E] border outline-none focus:ring-1 focus:ring-[#60340e] transition
                ${itemNameError ? "border-rose-500" : "border-[#60340e]/20"}`}
              placeholder="اسم الصنف *"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setItemNameError(false); }}
            />
            {itemNameError && <span className="text-xs text-rose-600 mt-1 pr-1 font-medium">الرجاء إدخال اسم الصنف</span>}
          </div>

          {/* المكونات */}
          <div className="flex flex-col md:col-span-2">
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e] transition"
              placeholder="المكونات أو الوصف التفصيلي (اختياري)"
              value={itemIngredients}
              onChange={(e) => setItemIngredients(e.target.value)}
            />
          </div>

          {/* الأسعار */}
          <div className="flex flex-col md:col-span-2">
            <input
              className={`w-full px-4 py-2.5 rounded-xl bg-white text-sm text-[#2C1A0E] border outline-none focus:ring-1 focus:ring-[#60340e] transition
                ${itemPriceError ? "border-rose-500" : "border-[#60340e]/20"}`}
              placeholder="الأسعار بالجميع (مثال: 15 أو 15,20 للنوعين) *"
              value={itemPrice}
              onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
            />
            {itemPriceError && <span className="text-xs text-rose-600 mt-1 pr-1 font-medium">الرجاء إدخال أسعار صحيحة</span>}
          </div>
        </div>

        <button
          onClick={addItem}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#60340e] text-[#F7F3E8] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#7A4218] active:scale-98 transition shadow-sm"
        >
          <FiPlus className="text-lg" />
          <span>إضافة الصنف الآن</span>
        </button>

        {/* Toast */}
        {showToast && (
          <div className="fixed top-6 right-1/2 translate-x-1/2 bg-[#60340e] text-white px-5 py-2.5 rounded-xl font-bold shadow-2xl z-50 animate-toast-show">
            تمت إضافة الصنف بنجاح ✅
          </div>
        )}
      </div>

      {/* ================== شريط البحث السريع ================== */}
      <div className="relative mb-5">
        <FiSearch className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#60340e]/40" size={18} />
        <input
          className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] transition"
          placeholder="ابحث بسرعة عن صنف، قسم، أو سعر..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
      </div>

      {/* ================== الأقسام والأصناف ================== */}
      <div className="space-y-3">
        {Object.keys(categories).map(catId => {
          const cat = categories[catId];
          const catItems = Object.keys(localItems)
            .map(id => ({ ...localItems[id], id }))
            .filter(item => item.categoryId === catId)
            .filter(item => {
              const search = quickSearch.toLowerCase();
              return (
                item.name.toLowerCase().includes(search) ||
                cat.name.toLowerCase().includes(search) ||
                String(item.price).split(",").some(p => p.includes(search))
              );
            });

          const isExpanded = expandedSections[catId] ?? true;

          return (
            <div key={catId} className="rounded-xl border border-[#60340e]/15 overflow-hidden elevation-1 bg-white">
              {/* Category Subheader Bar */}
              <div
                className="flex justify-between items-center cursor-pointer px-4 py-3 font-bold text-sm text-[#60340e] bg-[#FAF6ED] hover:bg-[#60340e]/10 transition"
                onClick={() => toggleSection(catId)}
              >
                <div className="flex items-center gap-3">
                  <span>{cat.name}</span>
                  <span className="bg-[#60340e] text-[#F7F3E8] text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    {catItems.length}
                  </span>
                </div>

                <span className="text-xs font-semibold text-[#60340e]/70">
                  {isExpanded ? "▲ طي الأصناف" : "▼ عرض الأصناف"}
                </span>
              </div>

              {/* Items List */}
              {isExpanded && (
                <div className="divide-y divide-[#60340e]/10">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 gap-3 transition-colors hover:bg-[#FAF6ED]/50 ${
                        !item.visible ? "opacity-60 bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Left: Image & Info */}
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        {item.image ? (
                          <div className="relative shrink-0">
                            <img
                              src={`/images/${item.image}`}
                              alt={item.name}
                              className="w-11 h-11 object-cover bg-gray-100 rounded-lg border border-[#60340e]/15 cursor-pointer shadow-xs"
                              onError={(e) => {
                                e.currentTarget.src = "/logo.png";
                              }}
                              onClick={() => openGallery(item.id, item.image)}
                            />
                            <button
                              onClick={() => removeImage(item.id)}
                              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 flex justify-center items-center bg-rose-600 text-white rounded-full hover:bg-rose-700 transition text-[10px] shadow-xs"
                              title="حذف الصورة"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openGallery(item.id)}
                            className="w-11 h-11 flex justify-center items-center rounded-lg bg-[#FAF6ED] text-[#60340e]/60 hover:bg-[#60340e]/10 hover:text-[#60340e] transition text-sm font-bold border border-[#60340e]/15 shrink-0"
                            title="إضافة صورة مصغرة"
                          >
                            +
                          </button>
                        )}

                        <div className="min-w-0">
                          <p className={`font-bold text-sm ${!item.visible ? "line-through text-gray-400" : "text-[#2C1A0E]"}`}>
                            {item.name}
                          </p>
                          {item.ingredients && (
                            <p className={`truncate text-xs ${!item.visible ? "text-gray-400" : "text-[#60340e]/70"}`}>
                              {item.ingredients}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-[#60340e] mt-0.5">
                            {item.price} ₪
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Toggle Availability Pill */}
                        <button
                          onClick={() => toggleItem(item.id, item.visible)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            item.visible
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                          }`}
                        >
                          {item.visible ? "متوفر" : "غير متوفر"}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setPopup({ type: "editItem", id: item.id })}
                          className="p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                          title="تعديل الصنف"
                        >
                          <FiEdit size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setPopup({ type: "deleteItem", id: item.id })}
                          className="p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
                          title="حذف الصنف"
                        >
                          <FiTrash2 size={15} />
                        </button>

                        {/* Star / Featured Button */}
                        <button
                          onClick={async () => {
                            if (!item.visible) return;
                            const newStar = !localItems[item.id].star;
                            await update(ref(db, `items/${item.id}`), { star: newStar });
                            setLocalItems(prev => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], star: newStar }
                            }));
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            !item.visible
                              ? "text-gray-300 cursor-not-allowed"
                              : localItems[item.id]?.star
                              ? "text-[#C9A84C]"
                              : "text-gray-300 hover:text-[#C9A84C]"
                          }`}
                          title="تعديل التمويز ⭐"
                        >
                          <FaStar size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {catItems.length === 0 && (
                    <p className="px-4 py-3 text-gray-400 text-xs font-medium">
                      لا توجد أصناف في هذا القسم
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Featured Image Gallery Picker */}
      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        galleryImages={galleryImages}
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
