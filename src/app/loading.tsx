import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0e0e10] text-white">
      <div className="flex flex-col items-center gap-4 text-[#adadb8]">
        <Spinner className="h-8 w-8" />
        <p>Loading VOD Creator...</p>
      </div>
    </div>
  );
}
