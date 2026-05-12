export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      {/* Spinning ring */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <div
          className="absolute inset-2 w-20 h-20 rounded-full border-2 border-transparent border-b-emerald-300 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="JMSA Builder"
            className="w-12 h-12 rounded-full object-contain shadow-lg"
          />
        </div>
      </div>
      {/* Brand name */}
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JMSA Builder</h1>
      <p className="text-sm text-gray-500 mt-1">par JM Services Africa</p>
    </div>
  );
}
