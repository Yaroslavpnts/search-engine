import { useMemo } from "react";
import { debounce } from "lodash";

export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  return useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callback(...args);
      }, delay),
    [callback, delay],
  );
}
