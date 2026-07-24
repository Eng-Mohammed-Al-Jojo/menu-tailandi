import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, push, remove, update, get, set } from "firebase/database";
import {
  FiDownload,
  FiSettings,
  FiUpload,
  FiLogOut,
  FiGrid,
  FiBox,
  FiCheckCircle,
  FiStar,
  FiDatabase,
  FiLayers,
  FiLock,
  FiUser,
  FiMenu,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import CategorySection from "../components/admin/CategorySection";
import ItemSection from "../components/admin/ItemSection";
import Popup from "../components/admin/Popup";
import { type PopupState } from "../components/admin/types";
import OrderSettingsModal from "../components/admin/OrderSettingsModal";

export default function Admin() {
  const [authOk, setAuthOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [categories, setCategories] = useState<any>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [items, setItems] = useState<any>({});
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [resetPasswordPopup, setResetPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [editItemValues, setEditItemValues] = useState<{
    itemName: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    itemIngredients?: string;
  }>({
    itemName: "",
    itemPrice: "",
    priceTw: "",
    selectedCategory: "",
    itemIngredients: "",
  });
  const [editItemId, setEditItemId] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderSettings, setShowOrderSettings] = useState(false);
  const [orderSettings, setOrderSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    orderSystem: false,
    orderSettings: { inRestaurant: false, takeaway: false, inPhone: "", outPhone: "" },
    complaintsWhatsapp: "",
    footerInfo: { address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" },
  });

  /* ===== Sidebar State ===== */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "categories" | "items">("dashboard");

  // ================= AUTH LISTENER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthOk(!!user);
    });
    return () => unsub();
  }, []);

  // ================= FIREBASE DATA =================
  useEffect(() => {
    if (!authOk) return;
    setLoading(true);

    const catRef = ref(db, "categories");
    const itemRef = ref(db, "items");
    onValue(catRef, (snap) => setCategories(snap.val() || {}));
    onValue(itemRef, (snap) => setItems(snap.val() || {}));
    setLoading(false);
  }, [authOk]);

  // ================= ORDER SETTINGS INITIALIZE =================
  useEffect(() => {
    if (!authOk) return;

    const settingsRef = ref(db, "settings");
    const initSettings = async () => {
      const snap = await get(settingsRef);
      if (!snap.exists()) {
        const defaultSettings = {
          complaintsWhatsapp: "",
          footerInfo: {
            address: "",
            facebook: "",
            instagram: "",
            phone: "",
            tiktok: "",
            whatsapp: "",
          },
          orderSettings: {
            inRestaurant: false,
            inPhone: "",
            takeaway: false,
            outPhone: "",
          },
          orderSystem: true,
        };
        await set(settingsRef, defaultSettings);
        setSettings(defaultSettings);
        setOrderSettings(defaultSettings);
      } else {
        const data = snap.val();
        setSettings(data);
        setOrderSettings(data);
      }
    };
    initSettings();
  }, [authOk]);

  // ================= LOGIN =================
  const login = async () => {
    if (!email || !password) {
      setToast("أدخل البريد وكلمة المرور ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast("تم تسجيل الدخول بنجاح ✅");
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("بيانات الدخول غير صحيحة ❌");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("أدخل البريد الإلكتروني أولاً ⚠️");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!");
    } catch (err: any) {
      setToast(err.message);
      setTimeout(() => setToast(""), 3000);
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await signOut(auth);
    setPopup({ type: null });
    setToast("تم تسجيل الخروج بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= CATEGORY =================
  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setToast("⚠️ يجب إدخال اسم القسم أولاً");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const newName = newCategoryName.trim();
    const exists = Object.values(categories).some(
      (cat: any) => cat.name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (exists) {
      setToast(`القسم "${newName}" موجود مسبقاً`);
      setTimeout(() => setToast(""), 3000);
      return;
    }
    await push(ref(db, "categories"), {
      name: newName,
      createdAt: Date.now(),
    });
    setNewCategoryName("");
    setPopup({ type: null });
    setToast(`تم إضافة القسم "${newName}" بنجاح ✅`);
    setTimeout(() => setToast(""), 4000);
  };

  const deleteCategory = async (id: string) => {
    await remove(ref(db, `categories/${id}`));
    Object.keys(items).forEach((itemId) => {
      if (items[itemId].categoryId === id) remove(ref(db, `items/${itemId}`));
    });
    setPopup({ type: null });
    setToast("تم حذف القسم بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= ITEMS =================
  const deleteItem = async () => {
    if (!popup.id) return;
    await remove(ref(db, `items/${popup.id}`));
    setPopup({ type: null });
    setToast("تم حذف الصنف بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  const updateItem = async () => {
    if (!editItemId) return;
    await update(ref(db, `items/${editItemId}`), {
      name: editItemValues.itemName,
      price: editItemValues.itemPrice,
      priceTw: editItemValues.priceTw || "",
      categoryId: editItemValues.selectedCategory,
      ingredients: editItemValues.itemIngredients || "",
    });
    setPopup({ type: null });
    setEditItemId("");
    setEditItemValues({
      itemName: "",
      itemPrice: "",
      priceTw: "",
      selectedCategory: "",
      itemIngredients: "",
    });
    setToast("تم التعديل بنجاح ✅");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= EXPORT EXCEL =================
  const exportToExcel = async () => {
    if (!categories || !items) {
      alert("البيانات لم يتم تحميلها بعد!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Items");

    sheet.columns = [
      { header: "الاسم", key: "name", width: 30 },
      { header: "السعر", key: "price", width: 15 },
      { header: "سعر TW", key: "priceTw", width: 15 },
      { header: "القسم", key: "categoryName", width: 30 },
      { header: "المكونات", key: "ingredients", width: 40 },
      { header: "متوفر", key: "visible", width: 10 },
      { header: "مميزة", key: "star", width: 10 },
      { header: "صورة", key: "image", width: 25 },
    ];

    Object.values(items).forEach((item: any) => {
      const categoryName = categories[item.categoryId]?.name ?? "غير محدد";
      sheet.addRow({
        name: item.name,
        price: item.price,
        priceTw: item.priceTw || "",
        categoryName,
        ingredients: item.ingredients || "",
        visible: item.visible ? "نعم" : "لا",
        star: item.star ? "⭐" : "",
        image: item.image || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "akila-menu.xlsx");

    setToast("تم تصدير البيانات بنجاح ✅");
    setTimeout(() => setToast(""), 3000);
  };

  // ================= IMPORT EXCEL =================
  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        setToast("ملف غير صالح ❌");
        setLoading(false);
        return;
      }

      const categoryMap: Record<string, string> = {};
      Object.entries(categories).forEach(([id, cat]: any) => {
        categoryMap[cat.name.trim().toLowerCase()] = id;
      });

      const rows: any[] = [];
      sheet.eachRow((row, index) => {
        if (index === 1) return;
        rows.push({
          name: row.getCell(1).value?.toString().trim() || "",
          price: row.getCell(2).value?.toString().trim() || "",
          priceTw: row.getCell(3).value?.toString().trim() || "",
          categoryName: row.getCell(4).value?.toString().trim() || "",
          ingredients: row.getCell(5).value?.toString().trim() || "",
          visible: row.getCell(6).value?.toString().trim().toLowerCase() === "نعم",
          star: row.getCell(7).value?.toString().trim() === "⭐",
          image: row.getCell(8).value?.toString().trim() || "",
        });
      });

      let addedCount = 0;
      for (const item of rows) {
        if (!item.name || !item.categoryName) continue;
        const categoryId = categoryMap[item.categoryName.toLowerCase()];
        if (!categoryId) continue;

        const exists = Object.values(items).some(
          (i: any) =>
            i.name.trim().toLowerCase() === item.name.toLowerCase() &&
            i.categoryId === categoryId
        );
        if (exists) continue;

        await push(ref(db, "items"), {
          name: item.name,
          price: item.price,
          priceTw: item.priceTw || "",
          categoryId,
          ingredients: item.ingredients || "",
          visible: item.visible ?? true,
          star: item.star ?? false,
          featured: item.featured || "",
          createdAt: Date.now(),
        });
        addedCount++;
      }

      if (addedCount > 0) setToast(`تم إضافة ${addedCount} صنف جديد ✅`);
      else setToast("القائمة محدثة بالفعل ✅");
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الاستيراد ❌");
    } finally {
      setLoading(false);
      e.target.value = "";
      setTimeout(() => setToast(""), 4000);
    }
  };

  // ================= EXPORT JSON =================
  const exportToJSON = () => {
    const data = {
      categories,
      items,
      settings: {
        orderSystem: settings.orderSystem,
        orderSettings: {
          inRestaurant: settings.orderSettings.inRestaurant,
          takeaway: settings.orderSettings.takeaway,
          inPhone: settings.orderSettings.inPhone,
          outPhone: settings.orderSettings.outPhone,
        },
        complaintsWhatsapp: settings.complaintsWhatsapp,
        footerInfo: {
          address: settings.footerInfo.address || "",
          phone: settings.footerInfo.phone || "",
          whatsapp: settings.footerInfo.whatsapp || "",
          facebook: settings.footerInfo.facebook || "",
          instagram: settings.footerInfo.instagram || "",
          tiktok: settings.footerInfo.tiktok || "",
        },
      },
      meta: { version: "1.0", exportedAt: Date.now() },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);

    setToast("📦 تم تصدير جميع البيانات والإعدادات بنجاح");
    setTimeout(() => setToast(""), 4000);
  };

  // ================= SAVE ORDER SETTINGS =================
  const handleSaveOrderSettings = async (newSettings: any) => {
    try {
      setLoading(true);
      await update(ref(db, "settings"), newSettings);
      setSettings(newSettings);
      setOrderSettings(newSettings);

      setToast("تم حفظ إعدادات الطلب بنجاح ✅");
      setShowOrderSettings(false);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error(err);
      setToast("حدث خطأ أثناء الحفظ ❌");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ================= KPI COMPUTED STATS =================
  const totalCategories = Object.keys(categories).length;
  const totalItems = Object.keys(items).length;
  const visibleItemsCount = Object.values(items).filter((i: any) => i.visible !== false).length;
  const starItemsCount = Object.values(items).filter((i: any) => i.star === true).length;

  // ================= LOGIN UI (SaaS Premium Authentication) =================
  if (!authOk) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#F5F2EB] p-4 relative overflow-hidden font-[Cairo]"
        dir="rtl"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#60340e]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-1/2 translate-x-1/2 z-50 bg-[#60340e] text-[#F7F3E8] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-toast-show flex items-center gap-2">
            <span>{toast}</span>
          </div>
        )}

        {/* POPUP: Reset Password */}
        {resetPasswordPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-[#FDFAF5] rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-[#60340e]/15 relative">
              <button
                onClick={() => {
                  setResetPasswordPopup(false);
                  setResetMessage("");
                }}
                className="absolute top-4 left-4 p-2 text-[#60340e]/60 hover:text-[#60340e] rounded-full transition"
              >
                <FiX size={20} />
              </button>

              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
              </div>
              <h2 className="text-xl font-bold mb-1 text-[#60340e] text-center">
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-xs text-[#60340e]/70 text-center mb-5">
                أدخل البريد الإلكتروني المسجل لإرسال رابط التعيين
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6ED] text-[#2C1A0E] border border-[#60340e]/20 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                {resetMessage && (
                  <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs text-center font-medium">
                    {resetMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleResetPassword}
                    className="flex-1 py-3 rounded-xl font-bold bg-[#60340e] text-[#F7F3E8] hover:bg-[#7A4218] transition active:scale-98"
                  >
                    إرسال الرابط
                  </button>
                  <button
                    onClick={() => {
                      setResetPasswordPopup(false);
                      setResetMessage("");
                    }}
                    className="px-5 py-3 rounded-xl font-semibold border border-[#60340e]/20 text-[#60340e] hover:bg-[#60340e]/5 transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Card Container */}
        {!resetPasswordPopup && (
          <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl admin-shadow-modal border border-[#60340e]/15 flex flex-col items-center animate-modal-enter">
            {/* Brand Header */}
            <div className="w-24 h-24 mb-4 rounded-full bg-[#FDFAF5] p-3 shadow-inner flex items-center justify-center border border-[#C9A84C]/30">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow" />
            </div>

            <h1 className="text-2xl font-extrabold text-[#60340e] mb-1">لوحة الأدمن</h1>
            <p className="text-xs text-[#60340e]/70 mb-6 font-medium">مطعم التايلندي — إدارة القائمة والإعدادات</p>

            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#60340e]/80 mb-1.5 pr-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <FiUser className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#60340e]/40" size={18} />
                  <input
                    type="email"
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-[#FAF6ED] text-[#2C1A0E] border border-[#60340e]/20 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm transition"
                    placeholder="admin@tailandi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#60340e]/80 mb-1.5 pr-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <FiLock className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#60340e]/40" size={18} />
                  <input
                    type="password"
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-[#FAF6ED] text-[#2C1A0E] border border-[#60340e]/20 focus:border-[#60340e] focus:ring-1 focus:ring-[#60340e] outline-none text-sm transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && login()}
                  />
                </div>
              </div>

              <button
                onClick={login}
                className="w-full py-3.5 rounded-xl font-bold bg-[#60340e] text-[#F7F3E8] hover:bg-[#7A4218] active:scale-98 transition shadow-lg shadow-[#60340e]/20 mt-2"
              >
                تسجيل الدخول
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={() => setResetPasswordPopup(true)}
                  className="text-xs font-medium text-[#60340e]/70 hover:text-[#60340e] hover:underline transition"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= ADMIN DASHBOARD SHELL =================
  return (
    <div className="min-h-screen w-full bg-[#F5F2EB] flex font-[Cairo] text-[#2C1A0E]" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-1/2 translate-x-1/2 z-50 bg-[#60340e] text-[#F7F3E8] px-6 py-3 rounded-2xl font-bold shadow-2xl animate-toast-show flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white px-6 py-5 rounded-2xl elevation-4 flex items-center gap-3 text-[#60340e] font-bold">
            <FiRefreshCw className="animate-spin text-xl text-[#C9A84C]" />
            <span>جاري المزامنة مع قاعدة البيانات...</span>
          </div>
        </div>
      )}

      {/* Hidden File Input for Excel Import */}
      <input type="file" accept=".xlsx" id="excelUpload" hidden onChange={importFromExcel} />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* ===== SIDEBAR NAVIGATION ===== */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-40
          w-64 bg-[#1E1711] text-[#F5F2EB]
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          border-l border-white/5 shadow-2xl shrink-0
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-[#C9A84C]/30 shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-[#F5F2EB] leading-tight">التايلندي</h1>
                <span className="text-[10px] text-[#C9A84C] font-semibold tracking-wider">لوحة التحكم الفاخرة</span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                activeTab === "dashboard"
                  ? "bg-[#60340e] text-white shadow-md border border-[#C9A84C]/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FiGrid className="text-lg text-[#C9A84C]" />
              <span>الملخص السريع</span>
            </button>

            <button
              onClick={() => { setActiveTab("categories"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                activeTab === "categories"
                  ? "bg-[#60340e] text-white shadow-md border border-[#C9A84C]/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FiLayers className="text-lg text-[#C9A84C]" />
              <span>إدارة الأقسام ({totalCategories})</span>
            </button>

            <button
              onClick={() => { setActiveTab("items"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                activeTab === "items"
                  ? "bg-[#60340e] text-white shadow-md border border-[#C9A84C]/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FiBox className="text-lg text-[#C9A84C]" />
              <span>إدارة الأصناف ({totalItems})</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Info & Live Status */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>متصل بـ Firebase Live</span>
          </div>

          <button
            onClick={() => setPopup({ type: "logout" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition duration-200 text-xs"
          >
            <FiLogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN WORKSPACE CONTENT CANVAS ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* TOP HEADER BAR */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#60340e]/10 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#60340e] hover:bg-[#60340e]/10 rounded-xl"
            >
              <FiMenu size={22} />
            </button>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#60340e]">لوحة الإدارة الرئيسية</h2>
              <p className="text-xs text-[#60340e]/60 font-medium hidden sm:block">إدارة وتحديث منيو مطعم التايلندي لحظياً</p>
            </div>
          </div>

          {/* Quick Action Toolbar Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* System Order Settings */}
            <button
              onClick={() => setShowOrderSettings(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF6ED] text-[#60340e] border border-[#60340e]/20 font-semibold text-xs hover:bg-[#60340e] hover:text-white transition shadow-xs"
              title="إعدادات النظام والطلب"
            >
              <FiSettings size={16} />
              <span className="hidden sm:inline">الإعدادات</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition shadow-xs"
              title="تصدير Excel"
            >
              <FiUpload size={16} />
              <span className="hidden sm:inline">تصدير Excel</span>
            </button>

            {/* Import Excel */}
            <button
              onClick={() => document.getElementById("excelUpload")?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700 text-white font-semibold text-xs hover:bg-sky-800 transition shadow-xs"
              title="استيراد Excel"
            >
              <FiDownload size={16} />
              <span className="hidden sm:inline">استيراد Excel</span>
            </button>

            {/* JSON Backup */}
            <button
              onClick={exportToJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 text-white font-semibold text-xs hover:bg-amber-800 transition shadow-xs"
              title="نسخة احتياطية JSON"
            >
              <FiDatabase size={16} />
              <span className="hidden sm:inline">نسخة JSON</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ===== KPI STATS SUMMARY CARDS WIDGET ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {/* Total Categories */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#60340e]/10 elevation-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#60340e]/60 block mb-1">إجمالي الأقسام</span>
                <span className="text-xl md:text-2xl font-extrabold text-[#60340e]">{totalCategories}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#60340e]/10 flex items-center justify-center text-[#60340e]">
                <FiLayers size={20} />
              </div>
            </div>

            {/* Total Items */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#60340e]/10 elevation-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#60340e]/60 block mb-1">إجمالي الأصناف</span>
                <span className="text-xl md:text-2xl font-extrabold text-[#60340e]">{totalItems}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#60340e]/10 flex items-center justify-center text-[#60340e]">
                <FiBox size={20} />
              </div>
            </div>

            {/* Available Items */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#60340e]/10 elevation-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#60340e]/60 block mb-1">الأصناف المتاحة</span>
                <span className="text-xl md:text-2xl font-extrabold text-emerald-700">{visibleItemsCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <FiCheckCircle size={20} />
              </div>
            </div>

            {/* Featured Items */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#60340e]/10 elevation-1 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#60340e]/60 block mb-1">المميزة ⭐</span>
                <span className="text-xl md:text-2xl font-extrabold text-[#C9A84C]">{starItemsCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#C9A84C]">
                <FiStar size={20} />
              </div>
            </div>
          </div>

          {/* ===== CATEGORY SECTION (Drag & Drop Reorder) ===== */}
          {(activeTab === "dashboard" || activeTab === "categories") && (
            <div className="w-full">
              <CategorySection
                categories={categories}
                setPopup={setPopup}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
              />
            </div>
          )}

          {/* ===== ITEM SECTION (Items Table & Add Form) ===== */}
          {(activeTab === "dashboard" || activeTab === "items") && (
            <div className="w-full">
              <ItemSection
                categories={categories}
                items={items}
                popup={popup}
                setPopup={(p) => {
                  setPopup(p);
                  if (p.type === "editItem" && p.id) {
                    const item = items[p.id];
                    if (item) {
                      setEditItemId(p.id);
                      setEditItemValues({
                        itemName: item.name,
                        itemPrice: item.price,
                        priceTw: item.priceTw || "",
                        selectedCategory: item.categoryId,
                        itemIngredients: item.ingredients || "",
                      });
                    }
                  }
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* ===== GLOBAL POPUP DIALOGS ===== */}
      <Popup
        popup={popup}
        setPopup={setPopup}
        addCategory={addCategory}
        deleteCategory={deleteCategory}
        deleteItem={deleteItem}
        updateItem={updateItem}
        editItemValues={editItemValues}
        setEditItemValues={setEditItemValues}
        categories={categories}
        resetPasswordPopup={resetPasswordPopup}
        setResetPasswordPopup={setResetPasswordPopup}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetMessage={resetMessage}
        handleResetPassword={handleResetPassword}
        logout={logout}
      />

      {/* ===== ORDER SETTINGS MODAL ===== */}
      {showOrderSettings && orderSettings && (
        <OrderSettingsModal
          setShowOrderSettings={setShowOrderSettings}
          orderSettings={orderSettings}
          onSave={handleSaveOrderSettings}
        />
      )}
    </div>
  );
}
