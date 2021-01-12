import { useRef, useCallback } from 'react';

export function useInstanceVar<T>(initialValue: T) {
  const instanceVarRef = useRef(initialValue);

  const getValue = useCallback(
    () => instanceVarRef.current,
    [],
  );

  const setValue = useCallback(
    (value: T) => instanceVarRef.current = value,
    [],
  );

  return [getValue, setValue] as const;
};
