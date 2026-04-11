export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 animate-pulse rounded-lg bg-[#E3E5EA]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 animate-pulse rounded-[16px] bg-[#E3E5EA]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[#E3E5EA]" />
      </div>
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-[16px] bg-[#E3E5EA]" />
        <div className="h-24 animate-pulse rounded-[16px] bg-[#E3E5EA]" />
      </div>
    </div>
  );
}
