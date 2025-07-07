"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShoppingBag, User, Menu, Search, X } from "lucide-react";
import { useCart } from "@/components/HeaderContext";
import { useEffect, useState, useRef } from "react";

interface ProductSuggestion {
  name: string;
  slug: string;
  main_image: string;
}

export default function Header() {
  const pathname = usePathname();
  const {
    quantity: cartQuantity,
    cartItems,
    refreshQuantity,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [user, setUser] = useState<{ username: string; full_name?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const [showCartDropdown, setShowCartDropdown] = useState(false);

  // Scroll state for header hide/show
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);

  // Helper function to get initials from name
  function getInitials(name: string) {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCartDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // ✅ Always try to fetch user if not already logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await fetch("http://localhost:8000/api/csrf/", { credentials: "include" });
        const res = await fetch("http://localhost:8000/api/account/user/", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser({
          username: data.email,
          full_name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
        });
        await refreshQuantity();
      } catch (err) {
        setUser(null);
      }
    };

    if (user === null) {
      fetchUser();
    }
  }, [user, refreshQuantity]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [searchOpen]);

  // Scroll handler to hide/show header on scroll down/up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await fetch("http://localhost:8000/api/account/logout/", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query =
      highlightedIndex >= 0 && suggestions[highlightedIndex]
        ? suggestions[highlightedIndex].name
        : searchTerm;
    if (query.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(query)}`;
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(e);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      fetch(
        `http://localhost:8000/api/products/search-suggestions/?query=${encodeURIComponent(
          searchTerm
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("Suggestions fetched:", data); // Debug log
          setSuggestions(data);
        })
        .catch((err) => {
          console.error("Error fetching suggestions:", err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b bg-white shadow-md transition-transform duration-300 ease-in-out ${
          hideHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between relative">
          {/* Mobile Menu Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="p-2 w-10 h-10 rounded-md hover:bg-red-50 focus-visible:outline-red-500 transition"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6 bg-white shadow-lg rounded-r-xl">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold text-gray-900">
                  Sky High
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-5 mt-6 text-gray-700 font-medium">
                <Link href="/brands" className="hover:text-red-600 transition">
                  Brands
                </Link>
                <Link href="/products" className="hover:text-red-600 transition">
                  Products
                </Link>
                <Link href="/about" className="hover:text-red-600 transition">
                  About
                </Link>
                <Link href="/services" className="hover:text-red-600 transition">
                  Services
                </Link>
                <Link href="/contact" className="hover:text-red-600 transition">
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Centered Logo */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            aria-label="Go to homepage"
          >
            <img
              src="http://127.0.0.1:8000/media/products/logo.jpg"
              alt="Sky High Logo"
              className="h-12 w-auto object-contain"
              loading="lazy"
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-5 z-20">
            {/* Search Button - hide when search bar is open */}
            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 w-10 h-10 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 focus-visible:outline-red-500 transition"
                aria-label="Open search"
              >
                <Search className="w-6 h-6" />
              </button>
            )}

            {/* Cart Dropdown */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setShowCartDropdown(!showCartDropdown)}
                className="p-2 w-10 h-10 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 focus-visible:outline-red-500 transition"
                aria-label={`Shopping cart with ${cartQuantity} items`}
              >
                <ShoppingBag className="w-6 h-6" />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow-lg">
                    {cartQuantity}
                  </span>
                )}
              </button>

              {showCartDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl z-50 p-5 max-h-96 overflow-y-auto ring-1 ring-gray-200">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Your cart is empty.</p>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 mb-4 last:mb-0">
                          <img
                            src={
                              item.main_image.startsWith("http")
                                ? item.main_image
                                : `http://localhost:8000${item.main_image}`
                            }
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">฿{item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() =>
                                  item.quantity > 1
                                    ? updateQuantity(item.id, item.quantity - 1)
                                    : removeFromCart(item.id)
                                }
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-red-50 transition"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                –
                              </button>
                              <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-red-50 transition"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs text-red-600 hover:underline ml-3"
                                aria-label={`Remove ${item.name} from cart`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-semibold mt-3">
                        <span>Total:</span>
                        <span>
                          ฿
                          {cartItems
                            .reduce((total, item) => total + item.price * item.quantity, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <Link
                        href="/cart"
                        className="block mt-4 w-full text-center bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                      >
                        View Cart
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 w-10 h-10 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 focus-visible:outline-red-500 transition"
                  aria-label="User menu"
                >
                  {user ? (
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-semibold select-none"
                      title={user.full_name || user.username}
                    >
                      {getInitials(user.full_name || user.username)}
                    </div>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {user ? (
                  <>
                    <DropdownMenuItem className="font-semibold text-gray-900 cursor-default select-none">
                      Hello, {user.full_name?.trim() || user.username}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="hover:text-red-600">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account/login" className="hover:text-red-600">
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/signup" className="hover:text-red-600">
                        Signup
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar Overlaying Logo */}
          {searchOpen && (
            <div
              ref={searchContainerRef}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-6 sm:px-8 lg:px-10 z-30"
              style={{ pointerEvents: "auto" }}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Find on skyhigh-inter.com"
                  className="w-full px-12 py-3 text-lg text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-300 focus:outline-none transition"
                  aria-label="Search products"
                />

                {/* Clear (X) icon on the left inside input */}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition"
                    aria-label="Clear search input"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Search icon button on the right inside input */}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition"
                  aria-label="Submit search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {suggestions.length > 0 ? (
                  <ul className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto ring-1 ring-gray-200">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setSearchOpen(false);
                          window.location.href = `/products?search=${encodeURIComponent(s.name)}`;
                        }}
                        className={`flex items-center gap-4 px-6 py-3 text-sm cursor-pointer select-none transition ${
                          i === highlightedIndex
                            ? "bg-red-100 text-red-700 font-semibold"
                            : "hover:bg-gray-100"
                        }`}
                        role="option"
                        aria-selected={i === highlightedIndex}
                        tabIndex={-1}
                      >
                        <img
                          src={
                            s.main_image.startsWith("http")
                              ? s.main_image
                              : `http://localhost:8000${s.main_image}`
                          }
                          alt={s.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm"
                          loading="lazy"
                        />
                        <span className="truncate">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  searchTerm.trim() && (
                    <div className="absolute z-40 w-full mt-2 bg-white text-gray-500 text-sm px-6 py-3 rounded-xl shadow ring-1 ring-gray-200 select-none">
                      No results found.
                    </div>
                  )
                )}
              </form>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
