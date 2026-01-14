"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/api/axios";
import { Star } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ItemCard = ({ item }) => {
  const formatPrice = (price) => `$${parseFloat(price).toFixed(0)}`;

  const calculateDiscountPercentage = (regularPrice, salePrice) => {
    const reg = parseFloat(regularPrice);
    const sale = parseFloat(salePrice);
    if (reg === 0) return 0;
    return Math.round(((reg - sale) / reg) * 100);
  };

  let boughtAndDigital = false;
  let boughtAndPrint = false;
  if (item?.payment?.length > 0) {
    const style = JSON.parse(item.payment[0]?.otherInfo || "{}")?.style;
    boughtAndDigital = style === "Digital Copy";
    boughtAndPrint = style === "Print Copy";
  }

  const isFree = item.pricingModel !== "Paid";
  const isOwned = boughtAndPrint || boughtAndDigital;

  const href =
    isOwned || isFree
      ? `/book/bookMaterial/${item.id}`
      : `/book/bookOrder/${item.id}`;

  // Mock rating for design matching
  const rating = 4.5;
  const maxRating = 5;

  return (
    <Link href={href} className="group block h-full">
      <div className="flex flex-col gap-3 h-full">
        {/* Image Container */}
        <div className="relative aspect-square bg-[#F2F0F1] dark:bg-gray-800 rounded-[20px] max-md:rounded-none overflow-hidden">
          <img
            src={item.featuredImage || "https://via.placeholder.com/300x300?text=No+Image"}
            alt={item.title}
            className="h-full w-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className="font-bold text-lg leading-tight text-foreground truncate" title={item.title}>
            {item.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-current" : i < rating ? "fill-current opacity-50" : ""}`}
                  strokeWidth={0}
                  fill="currentColor"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-1">
              <span className="text-foreground font-medium">{rating}</span>/{maxRating}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-2 pt-1">
            {!isFree ? (
              item.salePrice && parseFloat(item.salePrice) > 0 ? (
                <>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(item.salePrice)}
                  </span>
                  <span className="text-xl font-bold text-muted-foreground/40 line-through">
                    {formatPrice(item.regularPrice)}
                  </span>
                  <Badge variant="secondary" className="bg-red-100 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full px-3 py-0.5 text-xs font-medium border-0">
                    -{calculateDiscountPercentage(item.regularPrice, item.salePrice)}%
                  </Badge>
                </>
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(item.regularPrice)}
                </span>
              )
            ) : (
              <span className="text-xl font-bold text-green-600 dark:text-green-500">
                Free
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const ShowcaseSection = ({ title, items, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_LIMIT = 3;

  if (loading) {
    return (
      <div className="mb-16">
        <h2 className="text-4xl font-extrabold text-center mb-10 uppercase tracking-tight font-integral">
          <Skeleton className="h-10 w-48 mx-auto" />
        </h2>
        {/* Skeleton Grid that mimics the responsive layout */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-md:px-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 min-w-[280px] sm:min-w-0">
              <Skeleton className="aspect-square rounded-[20px] max-md:rounded-none w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items?.length) return null;

  // Determine which items to show based on expansion state
  const displayItems = isExpanded ? items : items.slice(0, INITIAL_LIMIT);
  const showViewAllButton = items.length > INITIAL_LIMIT;

  return (
    <div className="mb-16">
      <h2 className="text-4xl font-extrabold text-center mb-10 capitalize tracking-tight text-foreground">
        {title}
      </h2>

      {/* Responsive Layout:
         1. Mobile (< sm): Flex container, overflow-x-auto (scrollable), snap-x (carousel effect)
         2. Tablet/Desktop (>= sm): Grid layout
      */}
      <div className="
        flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 max-md:px-0 pb-4 mb-6
        sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:pb-0
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
      ">
        {displayItems.map((item) => (
          <div key={item.id} className="min-w-[280px] sm:min-w-0 snap-center">
            <ItemCard item={item} />
          </div>
        ))}
      </div>

      {showViewAllButton && (
        <div className="flex justify-center px-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full px-12 py-6 h-auto text-base font-medium border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 w-full sm:w-auto min-w-[200px]"
          >
            {isExpanded ? "Show Less" : "View All"}
          </Button>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-800 mt-16 mx-4"></div>
    </div>
  );
};

export default function BookShowcase({ fetchUrl }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const url = fetchUrl || "/api/allbook";
        const booksRes = await axios.get(url);
        setData(booksRes.data || {});
      } catch (error) {
        console.error("Failed to fetch showcase data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="container mx-auto py-12 max-w-7xl">
      {loading ? (
        <>
          <ShowcaseSection loading={true} />
          <ShowcaseSection loading={true} />
        </>
      ) : (
        Object.entries(data).map(([categoryName, items]) => (
          <ShowcaseSection
            key={categoryName}
            title={categoryName}
            items={items}
            loading={false}
          />
        ))
      )}
    </div>
  );
}