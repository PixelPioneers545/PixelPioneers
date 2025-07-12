import { useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (loading, hasMore, onLoadMore, threshold = 100) => {
  const observerRef = useRef();
  const loadingRef = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, {
      rootMargin: `${threshold}px`
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}; 