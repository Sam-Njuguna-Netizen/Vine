"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/app/api/axios";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "@/app/store";
import Link from "next/link";
import BookReviews from "@/app/(public)/components/BookReviews";
import CheckoutModal from "@/app/(public)/components/CheckoutModal";
import { Loader2, ShoppingCart, Minus, Plus, Check, Star } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function BookOrderPage() {
  const dispatch = useDispatch();
  // Add safety checks for Redux state
  const cartItems = useSelector((state) => state.cart?.items || []);
  const shipCond = useSelector((state) => state.cart?.shipingCondition || []);

  const { id } = useParams();
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [style, setStyle] = useState(null);
  const [singleStyle, setSingleStyle] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  useEffect(() => {
    try {
      console.log(singleStyle)
    } catch (error) {

    }
  }, [singleStyle])
  const isInCart = cartItems.some(
    (item) => item.bookId === id && item.style === style
  );

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  useEffect(() => {
    setFullAddress(
      [
        address.street,
        address.city,
        address.state,
        address.zip,
        address.country,
      ]
        .filter(Boolean)
        .join(", ")
    );
  }, [address]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/book/${id}`);
      setBookInfo(res.data || {});

      // Auto-select default style if available
      if (res.data?.categoryOption) {
        try {
          const parsed = JSON.parse(res.data.categoryOption);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStyle(parsed[0]);
          }
        } catch (e) {
          console.error("Error parsing category options", e);
        }
      }
    } catch (err) {
      console.error("Failed to load book", err);
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckoutClick = () => {
    if (
      !shipCond.includes(style) &&
      (!address.zip || !address.city || !address.state || !address.street)
    ) {
      toast.error("Please provide a complete shipping address.");
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleAddToCart = async () => {
    // For physical items, we might want to require address, but for "Add to Cart" usually we don't strictly enforce it 
    // until checkout. However, the current logic enforces it. 
    // Let's keep the enforcement but ensure the user knows why.
    // Address validation removed for "Add to Cart" action
    // It will be handled at checkout.

    // const validationRequired = !shipCond.includes(style); 
    // if (validationRequired && ... ) { ... }

    const cartItem = {
      bookId: id,
      quantity,
      style: singleStyle,
      shippingAddress: !shipCond.includes(style) ? fullAddress : null,
      book: bookInfo,
    };

    // Optimistically add to Redux store
    dispatch(addToCart(cartItem));
    toast.success(`${bookInfo.title} added to cart`);

    // Only try to save to server if we think the user is logged in (or just try and catch silently)
    // If the API fails (e.g. 401), we shouldn't remove it from the local cart if we want to support guest checkout.
    // However, if the app requires login for cart, then we should handle that.
    // Assuming mixed mode, we'll try to save but not revert local state on 401, only on other errors if critical.
    try {
      await axios.post("/api/cartAddOrUpdate", cartItem);
    } catch (error) {
      console.error("Failed to sync cart with server", error);
      // If it's a 401, it just means user isn't logged in, so we keep local cart.
      // If it's another error, we might want to warn user.
      if (error.response && error.response.status !== 401) {
        // toast.error("Failed to save cart to your account"); 
        // We can suppress this to avoid annoying guest users
      }
    }
  };

  const calculateDiscount = (regular, sale) => {
    if (!regular || !sale) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!bookInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Book Not Found</h2>
        <p className="text-muted-foreground">The book you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/book">Browse Books</Link>
        </Button>
      </div>
    );
  }

  let categoryOptions = [];
  try {
    if (bookInfo.categoryOption) {
      const parsed = JSON.parse(bookInfo.categoryOption);
      if (Array.isArray(parsed)) {
        categoryOptions = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse categoryOption:", e);
  }

  const showAddressForm = style && !shipCond.includes(style);
  const discount = calculateDiscount(bookInfo.regularPrice, bookInfo.salePrice);

  // Calculate average rating from reviews if available
  let averageRating = 0;
  let reviewCount = 0;
  try {
    if (bookInfo.reviews) {
      const reviews = JSON.parse(bookInfo.reviews);
      if (Array.isArray(reviews) && reviews.length > 0) {
        reviewCount = reviews.length;
        averageRating = reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviewCount;
      }
    }
  } catch (e) { }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Images */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-3 w-20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[2/3] border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <img
                    src={bookInfo.featuredImage || "/default.jpg"}
                    alt={`Thumbnail ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 aspect-[2/3] bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border shadow-sm relative">
              <img
                src={bookInfo.featuredImage || "/default.jpg"}
                alt={bookInfo.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{bookInfo.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-current" : "text-gray-300 dark:text-gray-600"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {averageRating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">${bookInfo.salePrice}</span>
              {bookInfo.regularPrice && (
                <span className="text-xl text-muted-foreground line-through font-medium">${bookInfo.regularPrice}</span>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 text-sm font-bold">
                  -{discount}%
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mt-4 leading-relaxed line-clamp-3">
              {bookInfo.description}
            </p>
          </div>

          <Separator />

          {/* Select Copy */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Select Copy</label>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSingleStyle(option)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${singleStyle === option
                    ? "gradient-button text-white"
                    : "bg-[#f0f0f0] text-black"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {!singleStyle && <p className="text-xs text-destructive mt-2">Please select a copy type</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
            <div className="flex items-center bg-[#f0f0f0] rounded-full p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-background rounded-md transition-colors"
              >
                <Minus className="h-4 w-4 text-black" />
              </button>
              <span className="w-12 text-center font-medium text-black">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-background rounded-md transition-colors"
              >
                <Plus className="h-4 w-4 text-black" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isInCart || !style}
              className={`flex-1 h-12 text-base font-semibold bg-[#1e40af] rounded-full ${isInCart
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
              {isInCart ? (
                <>
                  <Check className="mr-2 h-5 w-5 dark:text-white" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5 dark:text-white" /> Add to Cart
                </>
              )}
            </Button>

            <Button
              onClick={handleCheckoutClick}
              disabled={!style}
              variant="secondary"
              className="flex-1 h-12 text-base font-semibold gradient-button rounded-full  text-white"
            >
              Buy Now
            </Button>
          </div>
          {/* 
          {bookInfo?.payments?.length > 0 && (
            <div className="pt-2">
              <Link href={`/book/bookMaterial/${bookInfo.id}`}>
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                  View Owned Content
                </Button>
              </Link>
            </div>
          )} */}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <Tabs className="w-full">
          <div className="border-b border-border mb-8">
            <TabsList className="bg-transparent h-auto p-0 space-x-8">
              <TabsTrigger
                value="description"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-tranparent data-[state=active]:text-primary rounded-none px-0 py-3 text-lg font-medium text-muted-foreground hover:text-foreground shadow-none"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-primary  data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none  px-0 py-3 text-lg font-medium text-muted-foreground hover:text-foreground shadow-none"
              >
                Rating & Reviews
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="description" className="animate-in fade-in-50 duration-300">
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{bookInfo.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="animate-in fade-in-50 duration-300">
            <BookReviews bookId={id} initialReviews={bookInfo.reviews} />
          </TabsContent>
        </Tabs>
      </div>

      <CheckoutModal
        open={showCheckoutModal}
        onCancel={() => setShowCheckoutModal(false)}
        cartList={[
          {
            book: bookInfo,
            quantity,
            style,
            shippingAddress: !shipCond.includes(style) ? fullAddress : null,
          },
        ]}
      />
    </div>
  );
}
