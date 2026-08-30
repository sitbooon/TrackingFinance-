import { useQuery } from "@tanstack/react-query";
import { getMonthSnapshot } from "@/lib/kupa-data";
import { useKupaUi } from "@/lib/kupa-ui";

export function useSnapshot() {
  const month = useKupaUi((s) => s.month);
  return useQuery({
    queryKey: ["kupa", month],
    queryFn: () => getMonthSnapshot({ data: { month } }),
  });
}

export function isUnauthorized(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { message?: string; status?: number };
  return e.message === "Unauthorized" || e.status === 401;
}
