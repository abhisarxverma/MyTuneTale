import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  root?: Element | null;
}

interface UseInViewReturn {
  ref: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  entry?: IntersectionObserverEntry;
}

export const useInView = (options: UseInViewOptions = {}): UseInViewReturn => {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    root = null,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [currentEntry] = entries;
      setEntry(currentEntry);
      
      const isIntersecting = currentEntry.isIntersecting;
      
      // Update visibility state
      setIsVisible(isIntersecting);
      
      // If triggerOnce is true and element is visible, disconnect observer
      if (triggerOnce && isIntersecting && observerRef.current) {
        observerRef.current.disconnect();
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver is not supported in this browser');
      setIsVisible(true); // Fallback: assume visible
      return;
    }

    // Create observer with options
    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin,
      root,
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, root, handleIntersection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: elementRef,
    isVisible,
    entry,
  };
};

// Alternative hook with more advanced features
export const useAdvancedInView = (options: UseInViewOptions = {}) => {
  const {
    threshold = 0,
    rootMargin = '0px',
    triggerOnce = false,
    root = null,
  } = options;

  const [state, setState] = useState({
    isVisible: false,
    hasBeenVisible: false,
    entry: undefined as IntersectionObserverEntry | undefined,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [currentEntry] = entries;
      const isIntersecting = currentEntry.isIntersecting;
      
      setState(prevState => ({
        isVisible: isIntersecting,
        hasBeenVisible: prevState.hasBeenVisible || isIntersecting,
        entry: currentEntry,
      }));
      
      // If triggerOnce is true and element is visible, disconnect observer
      if (triggerOnce && isIntersecting && observerRef.current) {
        observerRef.current.disconnect();
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;

    // Fallback for unsupported browsers
    if (typeof IntersectionObserver === 'undefined') {
      setState(prev => ({
        ...prev,
        isVisible: true,
        hasBeenVisible: true,
      }));
      return;
    }

    const observerOptions: IntersectionObserverInit = {
      threshold,
      rootMargin,
      root,
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, root, handleIntersection]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: elementRef,
    isVisible: state.isVisible,
    hasBeenVisible: state.hasBeenVisible,
    entry: state.entry,
  };
};

// Utility hook for multiple elements
export const useMultipleInView = (options: UseInViewOptions = {}) => {
  const [elements, setElements] = useState<Map<string, boolean>>(new Map());
  
  const createRef = useCallback((id: string) => {
    const { ref, isVisible } = useInView(options);
    
    useEffect(() => {
      setElements(prev => new Map(prev).set(id, isVisible));
    }, [isVisible, id]);
    
    return { ref, isVisible };
  }, [options]);
  
  const isAnyVisible = Array.from(elements.values()).some(Boolean);
  const visibleCount = Array.from(elements.values()).filter(Boolean).length;
  
  return {
    createRef,
    elements,
    isAnyVisible,
    visibleCount,
  };
};