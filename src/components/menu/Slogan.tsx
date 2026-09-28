interface Props {
  large?: boolean;
}

/* سلوجان فخم: نص ذهبي متدرج محاط بخطوط ومعينات ذهبية مع توهج ناعم */
export default function Slogan({ large = false }: Props) {
  return (
    <div className="relative flex flex-col items-center">
      {/* توهج بني-ذهبي خفيف خلف النص */}
      <span className="absolute inset-x-4 -inset-y-1.5 bg-[#8B4513]/15 blur-xl rounded-full pointer-events-none" />

      <div className="relative flex items-center gap-2.5 md:gap-3">
        {/* زخرفة يمين */}
        <span className="h-px w-8 md:w-12 bg-gradient-to-l from-[#8B4513] via-[#8B4513]/60 to-transparent rounded-full" />
        <span className="w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-[#C9A84C] to-[#60340e] shadow-[0_0_6px_rgba(139,69,19,0.6)] shrink-0" />

        {/* النص الذهبي المائل للبني */}
        <p
          className={`
            font-[Cairo] font-semibold tracking-normal leading-relaxed whitespace-nowrap
            bg-[linear-gradient(115deg,#5C320E_0%,#8B4513_30%,#C9A84C_50%,#8B4513_70%,#5C320E_100%)]
            bg-clip-text text-transparent
            ${large ? "text-sm md:text-base" : "text-[13px] md:text-sm"}
          `}
        >
          الفكرة الأولى
        </p>

        {/* زخرفة يسار */}
        <span className="w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-[#C9A84C] to-[#60340e] shadow-[0_0_6px_rgba(139,69,19,0.6)] shrink-0" />
        <span className="h-px w-8 md:w-12 bg-gradient-to-r from-[#8B4513] via-[#8B4513]/60 to-transparent rounded-full" />
      </div>

      {/* خط سفلي رفيع مزدوج */}
      <div className="relative flex items-center gap-1.5 mt-2">
        <span className="h-px w-16 bg-gradient-to-r from-transparent via-[#8B4513]/70 to-transparent rounded-full" />
        <span className="w-1 h-1 rotate-45 bg-[#8B4513]/80 shrink-0" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent via-[#8B4513]/70 to-transparent rounded-full" />
      </div>
    </div>
  );
}
