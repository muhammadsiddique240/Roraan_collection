export default function AdvanceNoticeBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-3xl border border-black bg-white px-4 py-3 shadow-sm">
      <p className="text-center text-[11px] md:text-xs font-semibold tracking-wide text-black">
        Delivery Charges: PKR 400 in advance. Remaining amount will be Cash on Delivery (COD) - PKR 400.
      </p>
    </div>
  );
}
