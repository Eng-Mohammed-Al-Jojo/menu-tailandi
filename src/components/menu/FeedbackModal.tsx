import { useState, useEffect } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

interface Props {
  show: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = "feedbackSettings";

export default function FeedbackModal({ show, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const [feedbackPhone, setFeedbackPhone] = useState("");

  useEffect(() => {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const data = JSON.parse(localData);
      if (data.feedbackPhone) setFeedbackPhone(data.feedbackPhone);
    }

    const feedbackRef = ref(db, "settings/complaintsWhatsapp");
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const phone = snapshot.val();
        setFeedbackPhone(phone);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ feedbackPhone: phone })
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!show) {
      setName("");
      setPhone("");
      setMessage("");
      setRating(0);
      setHoverRating(0);
    }
  }, [show]);

  const handleSend = () => {
    if (!message.trim()) {
      setToast("الرجاء كتابة الملاحظة ⚠️");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!feedbackPhone) {
      setToast("⚠️ رقم الشكاوى غير متوفر حالياً");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const fullMessage = `⭐ تقييم زبون ⭐
------------------
🔹 الاسم: ${name || "-"}
🔹 الجوال: ${phone || "-"}
🔹 التقييم: ${rating}/5
🔹 الملاحظة: ${message || "-"}`;

    const url =
      "https://wa.me/" + feedbackPhone + "?text=" + encodeURIComponent(fullMessage);
    window.open(url, "_blank");

    setToast("تم إرسال الملاحظة بنجاح ✅");
    setTimeout(() => setToast(null), 3000);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        {/* Modal Container */}
        <div className="bg-[#FDF8EE] text-[#3D1F07] rounded-2xl w-full max-w-md p-6 relative elevation-5 border border-[#60340e]/15 max-h-[90vh] overflow-y-auto animate-modal-enter">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-[#60340e]/70 hover:text-[#60340e] hover:bg-[#60340e]/10 rounded-full transition-all duration-200"
            aria-label="إغلاق"
          >
            <FaTimes size={18} />
          </button>

          <h2 className="text-xl md:text-2xl font-bold text-center mb-1 text-[#60340e]">
            الآراء والشكاوى
          </h2>
          <p className="text-xs md:text-sm text-[#60340e]/70 text-center font-[Cairo]">
            نهتم بأرائكم ونعمل على إسعادكم ✨
          </p>

          <div className="flex flex-col gap-3.5 mt-5">
            <input
              type="text"
              placeholder="الاسم (اختياري)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6ED] text-[#3D1F07] border border-[#60340e]/30 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm transition-all"
            />
            <input
              type="tel"
              placeholder="رقم الجوال (اختياري)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6ED] text-[#3D1F07] border border-[#60340e]/30 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm text-right transition-all"
            />

            {/* تقييم النجوم */}
            <div className="flex flex-col items-center gap-1 my-1">
              <span className="text-xs text-[#60340e]/70">التقييم:</span>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform duration-150 hover:scale-125 focus:outline-none"
                  >
                    <FaStar
                      className={`w-7 h-7 transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? "text-[#C9A84C] drop-shadow-xs"
                          : "text-[#60340e]/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="الملاحظة *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6ED] text-[#3D1F07] border border-[#60340e]/30 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm resize-none transition-all"
              rows={4}
            />

            <button
              onClick={handleSend}
              className="w-full py-3 rounded-xl bg-[#60340e] text-[#F7F3E8] font-bold hover:bg-[#7A4218] active:scale-98 elevation-2 transition-all duration-200 mt-1"
            >
              إرسال عبر واتساب 📩
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#60340e] text-white px-5 py-3 rounded-2xl font-bold shadow-2xl animate-toast-show">
          {toast}
        </div>
      )}
    </>
  );
}
