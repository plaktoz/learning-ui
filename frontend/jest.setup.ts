import "@testing-library/jest-dom";

// jsdom doesn't implement matchMedia; components read it for "system" theme.
window.matchMedia =
  window.matchMedia ||
  function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
