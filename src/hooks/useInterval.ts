import {useEffect, useRef} from 'react';

// noop, not noob
const noop = () => {};

export function useInterval(
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean,
) {
  const savedCallback = useRef(noop);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
