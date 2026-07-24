import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiGrid } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category } from "./types";
import { HiChevronDown, HiOutlineArrowsUpDown } from "react-icons/hi2";

interface Props {
  categories: Record<string, Category>;
  setPopup: (popup: PopupState) => void;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
}

/* =======================
   العنصر القابل للسحب (Sortable Category Item)
======================= */
const SortableCategory: React.FC<{
  cat: Category & { id: string };
  editingId: string | null;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, name: string) => void;
  toggleAvailability: (id: string, current: boolean) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  editingId,
  tempName,
  setTempName,
  saveEdit,
  startEditing,
  toggleAvailability,
  setPopup,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cat.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="
        relative
        bg-[#FDFAF5]
        hover:bg-white
        border border-[#60340e]/15
        rounded-xl
        elevation-1
        hover:elevation-2
        flex items-center
        overflow-hidden
        transition-all duration-200
      "
    >
      {/* Drag Rail */}
      <div
        {...listeners}
        className="
          cursor-grab select-none
          bg-[#60340e]/10 hover:bg-[#60340e]/20
          w-11 sm:w-12 py-3.5
          flex items-center justify-center
          active:scale-95
          transition shrink-0
        "
        title="اسحب لإعادة الترتيب"
      >
        <HiOutlineArrowsUpDown className="w-5 h-5 text-[#60340e]" />
      </div>

      {/* المحتوى */}
      <div className="flex-1 px-4 py-2.5 flex items-center justify-between gap-3 min-w-0">
        {editingId === cat.id ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="flex-1 px-3 py-1.5 border border-[#60340e]/30 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-[#60340e]"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
            />
            <button
              onClick={() => saveEdit(cat.id)}
              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              title="حفظ"
            >
              <FiCheck size={18} />
            </button>
          </div>
        ) : (
          <span className="text-sm md:text-base font-bold text-[#2C1A0E] truncate">
            {cat.name}
          </span>
        )}

        {/* أدوات التحكم */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => startEditing(cat.id, cat.name)}
            className="p-2 text-sky-700 hover:bg-sky-50 rounded-lg transition"
            title="تعديل الاسم"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="حذف القسم"
          >
            <FiTrash2 size={16} />
          </button>

          {/* Toggle Switch */}
          <button
            onClick={() => toggleAvailability(cat.id, cat.available ?? true)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              cat.available ? "bg-emerald-600" : "bg-gray-300"
            }`}
            title={cat.available ? "القسم متاح" : "القسم غير متاح"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                cat.available ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================
   CategorySection Component
======================= */
const CategorySection: React.FC<Props> = ({
  categories,
  setPopup,
  newCategoryName,
  setNewCategoryName,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [openCategories, setOpenCategories] = useState(true);

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setTempName(name);
  };

  const saveEdit = async (id: string) => {
    if (!tempName.trim()) return;
    await update(ref(db, `categories/${id}`), { name: tempName.trim() });
    setEditingId(null);
    setTempName("");
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await update(ref(db, `categories/${id}`), {
      available: !current,
    });
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categoriesArray.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#60340e]/15 elevation-1">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiGrid className="text-xl text-[#60340e]" />
              <h2 className="font-bold text-lg md:text-xl text-[#60340e]">إدارة وإعادة ترتيب الأقسام</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#60340e]/10 text-[#60340e]">
              {categoriesArray.length} قسم
            </span>
          </div>

          {/* إضافة قسم جديد */}
          <div className="flex gap-2 flex-wrap mb-4">
            <input
              className="flex-1 px-4 py-2.5 border border-[#60340e]/20 rounded-xl text-sm bg-[#FAF6ED] outline-none focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] min-w-[200px]"
              placeholder="اكتب اسم قسم جديد..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setPopup({ type: "addCategory" })}
            />
            <button
              onClick={() => setPopup({ type: "addCategory" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#60340e] text-[#F7F3E8] font-bold text-sm hover:bg-[#7A4218] active:scale-98 transition shadow-sm"
            >
              <FiPlus className="text-lg" />
              <span>إضافة القسم</span>
            </button>
          </div>

          {/* Accordion Toggle Header */}
          <button
            onClick={() => setOpenCategories((p) => !p)}
            className="
              w-full mb-3
              flex items-center justify-between
              px-4 py-3
              bg-[#FAF6ED]
              rounded-xl
              font-bold text-sm text-[#60340e]
              hover:bg-[#60340e]/10
              transition duration-200
              border border-[#60340e]/10
            "
          >
            <span>ترتيب الأقسام المتاحة (سحب وإفلات)</span>

            <div className="flex items-center gap-2">
              <HiChevronDown
                className={`w-5 h-5 text-[#60340e] transition-transform duration-300 ${
                  openCategories ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
          </button>

          {/* Accordion Container */}
          <div
            className={`
              overflow-hidden
              transition-all duration-300 ease-in-out
              ${
                openCategories
                  ? "max-h-[3000px] opacity-100 scale-100"
                  : "max-h-0 opacity-0 scale-[0.98]"
              }
            `}
          >
            <div className="flex flex-col gap-2.5 pt-1">
              {categoriesArray.map((cat) => (
                <SortableCategory
                  key={cat.id}
                  cat={cat}
                  editingId={editingId}
                  tempName={tempName}
                  setTempName={setTempName}
                  saveEdit={saveEdit}
                  startEditing={startEditing}
                  toggleAvailability={toggleAvailability}
                  setPopup={setPopup}
                />
              ))}

              {categoriesArray.length === 0 && (
                <div className="text-center py-8 text-xs text-[#60340e]/60 font-medium">
                  لا توجد أقسام حالياً. أضف قسمك الأول اعلاه!
                </div>
              )}
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CategorySection;
