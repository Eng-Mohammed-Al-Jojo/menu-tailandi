import React from "react";
import { type PopupState } from "./types";
import { FiAlertTriangle, FiTrash2, FiEdit3, FiPlusCircle, FiLogOut, FiX } from "react-icons/fi";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  updateItem?: () => void;

  editItemValues?: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  };
  setEditItemValues?: (values: {
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }) => void;
  categories?: any;

  resetPasswordPopup?: boolean;
  setResetPasswordPopup?: (val: boolean) => void;
  resetEmail?: string;
  setResetEmail?: (val: string) => void;
  resetMessage?: string;
  handleResetPassword?: () => void;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  editItemValues,
  setEditItemValues,
  categories,
  resetPasswordPopup,
  setResetPasswordPopup,
  resetEmail,
  setResetEmail,
  resetMessage,
  handleResetPassword,
  logout,
}) => {
  if (!popup.type && !resetPasswordPopup) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => {
          setPopup({ type: null });
          setResetPasswordPopup && setResetPasswordPopup(false);
        }}
      />

      {/* Modal Dialog Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
        <div className="relative bg-[#FDFAF5] p-6 md:p-7 rounded-2xl admin-shadow-modal w-full max-w-md border border-[#60340e]/20 animate-modal-enter">
          {/* Close Button */}
          <button
            onClick={() => {
              setPopup({ type: null });
              setResetPasswordPopup && setResetPasswordPopup(false);
            }}
            className="absolute top-4 left-4 p-1.5 text-[#60340e]/60 hover:text-[#60340e] hover:bg-[#60340e]/10 rounded-full transition"
            aria-label="إغلاق"
          >
            <FiX size={18} />
          </button>

          {/* ===== LOGOUT MODAL ===== */}
          {popup.type === "logout" && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <FiLogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#60340e]">تسجيل الخروج</h3>
                <p className="text-xs text-[#60340e]/70 mt-1">هل أنت تأكد من رغبتك في الخروج من لوحة التحكم؟</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    logout && logout();
                    setPopup({ type: null });
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#60340e] text-[#F7F3E8] hover:bg-[#7A4218] transition active:scale-98 text-sm"
                >
                  نعم، خروج
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="flex-1 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ===== ADD CATEGORY MODAL ===== */}
          {popup.type === "addCategory" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#60340e] border-b border-[#60340e]/10 pb-3">
                <FiPlusCircle size={20} />
                <h3 className="text-lg font-bold">تأكيد إضافة قسم جديد</h3>
              </div>
              <p className="text-xs text-[#60340e]/70">هل ترغب في حفظ القسم الجديد وإتاحته في القائمة؟</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={addCategory}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition text-sm shadow-xs"
                >
                  حفظ القسم
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-5 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ===== DELETE CATEGORY MODAL ===== */}
          {popup.type === "deleteCategory" && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#60340e]">تأكيد حذف القسم</h3>
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  سيتم حذف القسم وجميع الأصناف المرتبطة به نهائياً!
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => deleteCategory && deleteCategory(popup.id!)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-rose-700 text-white hover:bg-rose-800 transition active:scale-98 text-sm"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="flex-1 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ===== DELETE ITEM MODAL ===== */}
          {popup.type === "deleteItem" && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <FiTrash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#60340e]">تأكيد حذف الصنف</h3>
                <p className="text-xs text-[#60340e]/70 mt-1">هل أنت متأكد من حذف هذا الصنف من القائمة؟</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={deleteItem}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-rose-700 text-white hover:bg-rose-800 transition active:scale-98 text-sm"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="flex-1 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ===== EDIT ITEM MODAL ===== */}
          {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#60340e] border-b border-[#60340e]/10 pb-3">
                <FiEdit3 size={18} />
                <h3 className="text-lg font-bold">تعديل معلومات الصنف</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/80 mb-1 pr-1">القسم</label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e]"
                    value={editItemValues.selectedCategory}
                    onChange={(e) =>
                      setEditItemValues({
                        ...editItemValues,
                        selectedCategory: e.target.value,
                      })
                    }
                  >
                    {Object.keys(categories).map((id) => (
                      <option key={id} value={id}>
                        {categories[id].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/80 mb-1 pr-1">اسم الصنف</label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e]"
                    placeholder="اسم الصنف"
                    value={editItemValues.itemName}
                    onChange={(e) =>
                      setEditItemValues({
                        ...editItemValues,
                        itemName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/80 mb-1 pr-1">المكونات / الوصف</label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e]"
                    placeholder="المكونات"
                    value={editItemValues.itemIngredients || ""}
                    onChange={(e) =>
                      setEditItemValues({
                        ...editItemValues,
                        itemIngredients: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/80 mb-1 pr-1">الأسعار</label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e]"
                    placeholder="الأسعار مفصولة بفواصل"
                    value={editItemValues.itemPrice}
                    onChange={(e) =>
                      setEditItemValues({
                        ...editItemValues,
                        itemPrice: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={updateItem}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#60340e] text-[#F7F3E8] hover:bg-[#7A4218] transition text-sm shadow-xs"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setPopup({ type: null })}
                  className="px-5 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ===== RESET PASSWORD MODAL ===== */}
          {resetPasswordPopup && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#60340e] border-b border-[#60340e]/10 pb-3">إعادة تعيين كلمة المرور</h3>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6ED] text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:ring-1 focus:ring-[#60340e]"
                value={resetEmail}
                onChange={(e) => setResetEmail && setResetEmail(e.target.value)}
              />

              {resetMessage && (
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl text-center">
                  {resetMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleResetPassword}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#60340e] text-[#F7F3E8] hover:bg-[#7A4218] transition text-sm"
                >
                  إرسال الرابط
                </button>
                <button
                  onClick={() => setResetPasswordPopup && setResetPasswordPopup(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
