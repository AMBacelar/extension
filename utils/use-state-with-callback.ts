import { useState } from 'react';

function useStateWithCallback<T>(
  initialValue: T
): [T, (setter: T, callback?: (prev: T, next: T) => void) => void] {
  const [value, setValue] = useState<T>(initialValue);

  const setValueAndCallback = (
    newValue: T,
    callback?: (prev: T, next: T) => void
  ) => {
    setValue((prevValue) => {
      if (callback) {
        callback(prevValue, newValue);
      }
      return newValue;
    });
  };

  return [value, setValueAndCallback];
}

export { useStateWithCallback };
