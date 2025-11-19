import { MapPin, Package, Star } from "lucide-react";

const ShopDisplayCard = ({ shop }) => {
  return (
    <div className="min-w-[300px] bg-white rounded-2xl shadow-md hover:shadow-lg transition flex-shrink-0 overflow-hidden border">
      {/* Shop Image */}
      <img
        src={shop.image?.url || "/placeholder.jpg"}
        alt={shop.name}
        className="w-full h-40 object-cover"
      />

      {/* Shop Info */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-lg truncate">{shop.name}</h3>
          <div className="flex items-center text-green-600 font-semibold text-sm">
            <Star size={16} className="mr-1 fill-green-500" />
            {shop.rating || "4.2"}
          </div>
        </div>

        {/* Address & City */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin size={14} className="mr-1" />
          {shop.city}, {shop.state}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {shop.address}
        </p>

        {/* Shop Items */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Package size={14} className="mr-1" />
            {shop.items?.length || 0} items
          </div>
          <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopDisplayCard;
