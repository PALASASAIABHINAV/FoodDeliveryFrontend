import React from "react";
import { MapPin, Package, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopDisplayCard = ({ shop }) => {
  const navigate = useNavigate();
  if (!shop) return null;

  const hasRating = typeof shop.rating === "number";

  const handleClick = () => {
    if (shop._id) {
      navigate(`/shop/${shop._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="
        min-w-[280px] max-w-sm bg-white rounded-2xl 
        shadow-md hover:shadow-2xl transition-all duration-300 
        flex-shrink-0 overflow-hidden border border-slate-200 
        hover:border-emerald-500 cursor-pointer group
      "
    >
      {/* IMAGE */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={shop.image?.url || "/placeholder.jpg"}
          alt={shop.name}
          className="
            w-full h-full object-cover 
            group-hover:scale-110 transition-transform duration-500
          "
        />

        {/* Top-left city tag */}
        <div className="
          absolute top-3 left-3 
          bg-black/60 text-white text-[11px] font-medium 
          px-2 py-1 rounded-full backdrop-blur-sm
        ">
          {shop.city}, {shop.state}
        </div>

        {/* Top-right rating or 'New' */}
        <div className="
          absolute top-3 right-3 
          bg-white/90 rounded-full px-2.5 py-1 
          flex items-center gap-1 shadow-sm
        ">
          {hasRating ? (
            <>
              <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">
                {shop.rating.toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600">
              New
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        {/* NAME + CTA ARROW */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-base text-slate-900 truncate">
            {shop.name}
          </h3>
          <div className="
            inline-flex items-center gap-1 text-[11px] font-semibold 
            text-emerald-600 group-hover:text-emerald-700
          ">
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* ADDRESS SHORT */}
        <div className="flex items-start text-xs text-slate-500 gap-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
          <p className="line-clamp-2">{shop.address}</p>
        </div>

        {/* FOOTER ROW */}
        <div className="pt-2 mt-1 flex items-center justify-between text-xs">
          {/* Items count */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="font-medium">
              {shop.items?.length || 0} item
              {(shop.items?.length || 0) === 1 ? "" : "s"}
            </span>
          </div>

          {/* Status pill */}
          <span className="
            inline-flex items-center px-2.5 py-1 
            rounded-full text-[11px] font-semibold 
            bg-emerald-50 text-emerald-700
          ">
            Open • ZentroEat Partner
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopDisplayCard;
