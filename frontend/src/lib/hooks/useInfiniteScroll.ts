import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(onIntersect: () => Promise<void>, options: UseInfiniteScrollOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("[create] creating observer...");
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          try {
            await onIntersect();
          } finally {
            setIsLoading(false);
          }
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "200px",
      }
    );

    observerRef.current = observer;

    return () => {
      console.log("[create] observer disconnecting...");
      observer.disconnect();
    };
  }, [onIntersect, isLoading, options.threshold, options.rootMargin]);

  useEffect(() => {
    console.log("[observe] observer attaching effect running...");
    const currentTarget = targetRef.current;
    const currentObserver = observerRef.current;

    if (currentTarget && currentObserver) {
      console.log("[observe] observer attaching to target...");
      currentObserver.observe(currentTarget);
      return () => {
        console.log("[observe] observer unobserving...");
        currentObserver.unobserve(currentTarget);
      };
    }
  }, []);

  return { targetRef, isLoading };
}
