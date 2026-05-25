import { createSignal, createMemo, onMount, onCleanup, For, Show } from 'solid-js';
import type { Country } from '~/lib/auth/countryData';
import { COUNTRIES, getSortedCountries, searchCountries } from '~/lib/auth/countryData';

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  autoDetectedCountry?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Virtual scrolling configuration
const ITEM_HEIGHT = 60; // Height of each country item in pixels
const VISIBLE_ITEMS = 10; // Number of items to render at once
const BUFFER_ITEMS = 3; // Extra items to render above/below for smooth scrolling

export function CountrySelector(props: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  const [scrollTop, setScrollTop] = createSignal(0);
  let modalRef: HTMLDivElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;
  let listRef: HTMLDivElement | undefined;

  // Get sorted and filtered countries (lazy loaded)
  const filteredCountries = createMemo(() => {
    const query = searchQuery().trim();
    if (!query) {
      // Return sorted countries with popular ones first
      return getSortedCountries();
    }
    // Search is active, return filtered results
    return searchCountries(query);
  });

  // Virtual scrolling calculations
  const visibleRange = createMemo(() => {
    const countries = filteredCountries();
    const startIndex = Math.max(0, Math.floor(scrollTop() / ITEM_HEIGHT) - BUFFER_ITEMS);
    const endIndex = Math.min(
      countries.length,
      startIndex + VISIBLE_ITEMS + BUFFER_ITEMS * 2
    );
    return { startIndex, endIndex };
  });

  const visibleCountries = createMemo(() => {
    const countries = filteredCountries();
    const { startIndex, endIndex } = visibleRange();
    return countries.slice(startIndex, endIndex).map((country, idx) => ({
      country,
      index: startIndex + idx,
    }));
  });

  const totalHeight = createMemo(() => filteredCountries().length * ITEM_HEIGHT);
  const offsetY = createMemo(() => visibleRange().startIndex * ITEM_HEIGHT);

  // Reset search and focus when modal opens
  const handleOpen = () => {
    setSearchQuery('');
    setFocusedIndex(0);
    // Focus search input after a brief delay to ensure modal is rendered
    setTimeout(() => {
      searchInputRef?.focus();
    }, 50);
  };

  // Handle scroll for virtual scrolling
  const handleScroll = (e: Event) => {
    const target = e.currentTarget as HTMLDivElement;
    setScrollTop(target.scrollTop);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    const countries = filteredCountries();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, countries.length - 1));
        scrollToFocused();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        scrollToFocused();
        break;
      case 'Enter':
        e.preventDefault();
        const selectedCountry = countries[focusedIndex()];
        if (selectedCountry) {
          props.onSelect(selectedCountry);
          props.onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        props.onClose();
        break;
    }
  };

  // Scroll focused item into view (for virtual scrolling)
  const scrollToFocused = () => {
    if (!listRef) return;
    
    const targetScrollTop = focusedIndex() * ITEM_HEIGHT;
    const containerHeight = listRef.clientHeight;
    const currentScrollTop = listRef.scrollTop;
    
    // Check if focused item is outside visible area
    if (targetScrollTop < currentScrollTop) {
      // Scroll up
      listRef.scrollTop = targetScrollTop;
    } else if (targetScrollTop + ITEM_HEIGHT > currentScrollTop + containerHeight) {
      // Scroll down
      listRef.scrollTop = targetScrollTop + ITEM_HEIGHT - containerHeight;
    }
  };

  // Handle click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef && !modalRef.contains(e.target as Node)) {
      props.onClose();
    }
  };

  // Handle country selection
  const handleSelectCountry = (country: Country) => {
    props.onSelect(country);
    props.onClose();
  };

  // Setup and cleanup event listeners
  onMount(() => {
    if (props.isOpen) {
      handleOpen();
    }
  });

  // Watch for isOpen changes
  const setupListeners = () => {
    if (props.isOpen) {
      handleOpen();
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  };

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  // Re-setup listeners when isOpen changes
  createMemo(() => {
    const cleanup = setupListeners();
    return cleanup;
  });

  return (
    <Show when={props.isOpen}>
      {/* Backdrop with glassmorphism */}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out] pr-20"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      >
        {/* Modal container */}
        <div
          ref={modalRef}
          class="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slide-in-from-bottom_0.3s_cubic-bezier(0.16,1,0.3,1)]"
          style={{
            animation: 'slide-in-from-bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Select country"
        >
          {/* Header with search */}
          <div class="sticky top-0 z-10 bg-white border-b border-slate-900/10 p-4">
            <h2 class="text-lg font-semibold text-slate-900 mb-3">Select Country</h2>
            
            {/* Search input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery()}
              onInput={(e) => {
                setSearchQuery(e.currentTarget.value);
                setFocusedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search country or code..."
              class="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-900/40 rounded-lg border border-slate-900/20 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              aria-label="Search countries"
              autocomplete="off"
            />
          </div>

          {/* Country list with virtual scrolling */}
          <div
            ref={listRef}
            class="overflow-y-auto max-h-[60vh] scrollbar-hide"
            role="listbox"
            aria-label="Country list"
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
          >
            <Show
              when={filteredCountries().length > 0}
              fallback={
                <div class="p-8 text-center text-slate-900/50">
                  No countries found
                </div>
              }
            >
              {/* Virtual scrolling container */}
              <div style={{ height: `${totalHeight()}px`, position: 'relative' }}>
                <div
                  style={{
                    transform: `translateY(${offsetY()}px)`,
                    'will-change': 'transform',
                  }}
                >
                  <For each={visibleCountries()}>
                    {(item) => {
                      const { country, index } = item;
                      const isSelected = country.code === props.selectedCountry.code;
                      const isAutoDetected = country.code === props.autoDetectedCountry;
                      const isFocused = index === focusedIndex();

                      return (
                        <button
                          type="button"
                          data-index={index}
                          onClick={() => handleSelectCountry(country)}
                          class={`w-full flex items-center gap-3 px-4 text-left transition-colors ${
                            isFocused
                              ? 'bg-blue-600/20'
                              : isSelected
                              ? 'bg-slate-900/5'
                              : 'hover:bg-slate-900/5'
                          }`}
                          style={{ height: `${ITEM_HEIGHT}px` }}
                          role="option"
                          aria-selected={isSelected}
                          tabIndex={isFocused ? 0 : -1}
                        >
                          {/* Flag */}
                          <span class="text-2xl flex-shrink-0" aria-hidden="true">
                            {country.flag}
                          </span>

                          {/* Country info */}
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                              <span class="text-slate-900 font-medium truncate">
                                {country.name}
                              </span>
                              {isAutoDetected && (
                                <span class="px-2 py-0.5 text-xs font-medium bg-blue-600/20 text-blue-600 rounded">
                                  Auto-detected
                                </span>
                              )}
                            </div>
                            <span class="text-sm text-slate-900/50">{country.dialCode}</span>
                          </div>

                          {/* Selected indicator */}
                          {isSelected && (
                            <svg
                              class="w-5 h-5 text-green-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>
          </div>

          {/* Footer hint */}
          <div class="sticky bottom-0 bg-white border-t border-slate-900/10 px-4 py-3">
            <p class="text-xs text-slate-900/40 text-center">
              Use arrow keys to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      </div>
    </Show>
  );
}
