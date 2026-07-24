import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { FiSettings, FiX, FiMessageSquare, FiMapPin, FiSave } from "react-icons/fi";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-bold animate-toast-show flex items-center gap-2
        ${type === "success" ? "bg-emerald-700" : "bg-rose-700"}`}
    >
      <span>{message}</span>
    </div>
  );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({
  setShowOrderSettings,
  orderSettings: initialSettings,
  onSave,
}: {
  setShowOrderSettings: (v: boolean) => void;
  orderSettings: any;
  onSave: (newSettings: any) => void;
}) {
  const [orderSystem, setOrderSystem] = useState(true);
  const [inRestaurant, setInRestaurant] = useState(false);
  const [takeaway, setTakeaway] = useState(false);
  const [inPhone, setInPhone] = useState("");
  const [outPhone, setOutPhone] = useState("");
  const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (!initialSettings) return;

    setOrderSystem(initialSettings.orderSystem ?? true);

    const s = initialSettings.orderSettings ?? {};
    setInRestaurant(!!s.inRestaurant);
    setTakeaway(!!s.takeaway);
    setInPhone(s.inPhone || "");
    setOutPhone(s.outPhone || "");

    setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
    setFooter(initialSettings.footerInfo || {});
    setLoading(false);
  }, [initialSettings]);

  if (loading) return null;

  /* ===== Save with Validation ===== */
  const handleSave = async () => {
    if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
      setToast({ type: "error", message: "❌ الرجاء إدخال رقم واتساب لكل خدمة مفعّلة" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const newSettings = {
      orderSystem,
      orderSettings: { inRestaurant, takeaway, inPhone, outPhone },
      complaintsWhatsapp,
      footerInfo: footer,
    };

    try {
      setSaving(true);
      await update(ref(db, "settings"), newSettings);
      onSave?.(newSettings);

      setToast({ type: "success", message: "💾 تم حفظ الإعدادات بنجاح" });
      setShowOrderSettings(false);
    } catch {
      setToast({ type: "error", message: "❌ فشل الحفظ" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2000);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl bg-white text-sm text-[#2C1A0E] border border-[#60340e]/20 outline-none focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] transition";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3" dir="rtl">
      <div className="bg-[#FDFAF5] w-full max-w-lg max-h-[90vh] rounded-2xl text-[#2C1A0E] border border-[#60340e]/20 admin-shadow-modal flex flex-col animate-modal-enter overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#60340e]/10 bg-white">
          <div className="flex items-center gap-2 text-[#60340e]">
            <FiSettings size={20} />
            <h2 className="text-base md:text-lg font-bold">إعدادات النظام والمعلومات العامة</h2>
          </div>
          <button
            onClick={() => setShowOrderSettings(false)}
            className="p-1.5 text-[#60340e]/60 hover:text-[#60340e] hover:bg-[#60340e]/10 rounded-full transition"
            aria-label="إغلاق"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Complaints Section */}
          <div className="bg-[#FAF6ED] rounded-xl p-4 border border-[#60340e]/10 space-y-2">
            <div className="flex items-center gap-2 text-[#60340e] font-bold text-sm">
              <FiMessageSquare size={16} />
              <span>واتساب الشكاوى والآراء (رقم التلقي)</span>
            </div>
            <input
              value={complaintsWhatsapp}
              onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
              placeholder="مثال: 0097259xxxxxxx"
              className={inputClass}
            />
          </div>

          {/* Footer Info Section */}
          <div className="bg-[#FAF6ED] rounded-xl p-4 border border-[#60340e]/10 space-y-3">
            <div className="flex items-center gap-2 text-[#60340e] font-bold text-sm border-b border-[#60340e]/10 pb-2">
              <FiMapPin size={16} />
              <span>معلومات الفوتر وشبكات التواصل</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">العنوان</label>
                <input
                  placeholder="مثال: غزة - الجلاء"
                  value={footer.address}
                  onChange={(e) => setFooter({ ...footer, address: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">رقم الهاتف التواصل</label>
                <input
                  placeholder="مثال: 059XXXXXXX"
                  value={footer.phone}
                  onChange={(e) => setFooter({ ...footer, phone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">رقم الواتساب الرئيسي</label>
                <input
                  placeholder="مثال: 0097259XXXXXXX"
                  value={footer.whatsapp}
                  onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">Facebook</label>
                  <input
                    placeholder="رابط فيسبوك"
                    value={footer.facebook}
                    onChange={(e) => setFooter({ ...footer, facebook: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">Instagram</label>
                  <input
                    placeholder="رابط إنستغرام"
                    value={footer.instagram}
                    onChange={(e) => setFooter({ ...footer, instagram: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#60340e]/70 mb-1 pr-1">TikTok</label>
                  <input
                    placeholder="رابط تيك توك"
                    value={footer.tiktok}
                    onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-4 border-t border-[#60340e]/10 bg-white flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#60340e] text-[#F7F3E8] font-bold text-sm hover:bg-[#7A4218] active:scale-98 transition shadow-sm w-full sm:w-auto"
          >
            <FiSave size={18} />
            <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
          </button>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}
