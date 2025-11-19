import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "../../store/useShopStore";
import { useItemStore } from "../../store/useItemStore";
import Navbar from "../common/Navbar";
import { useUserStore } from "../../store/useAuthStore";
import OwnerVerificationForm from "./OwnerVerificationForm";



const OwnerDashboard = () => {
  const { user, loading: userLoading } = useUserStore();
  const { shop, loading: shopLoading, fetchMyShop } = useShopStore();
  const {
    items,
    loading: itemLoading,
    fetchItemsByShop,
    deleteItem,
  } = useItemStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyShop();
  }, []);

  // 🔹 Fetch items when shop is available
  useEffect(() => {
    if (shop?._id) fetchItemsByShop(shop._id);
  }, [shop]);
  
    // while user still loading
  if (userLoading || !user) {
    return (
      <div className="text-center mt-10 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // 🔐 If owner is NOT verified → show verification form instead of Add Shop
  if (user.role === "owner" && !user.isVerifiedOwner) {
    return (
      <>
        <OwnerVerificationForm />
      </>
    );
  }

  if (shopLoading)
    return (
      <div className="text-center mt-10 text-lg font-semibold">Loading...</div>
    );

  if (!shop)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-semibold mb-4">
          You don’t have a shop yet
        </h2>
        <button
          onClick={() => navigate("/create-shop")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-700 transition"
        >
          + Add Shop
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Navbar />
      <h2 className="text-2xl font-semibold mb-4">My Shop</h2>

      <div className="border p-4 rounded shadow bg-gray-50">
        <img
          src={shop?.image?.url}
          alt={shop?.name}
          className="w-32 h-32 object-cover rounded mb-3"
        />
        <h3 className="text-xl font-bold">{shop?.name}</h3>
        <p>
          {shop?.city}, {shop?.state}
        </p>
        <p>{shop?.address}</p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate("/edit-shop")}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Edit Shop
        </button>
        <button
          onClick={() => navigate("/add-item")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      {/* 🔹 Items Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Items in My Shop</h3>

        {itemLoading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="border p-3 rounded shadow-sm bg-white hover:shadow-md transition"
              >
                <img
                  src={item.image?.url}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h4 className="text-lg font-bold mt-2">{item.name}</h4>
                <p className="text-gray-600">₹{item.price}</p>
                <p className="text-gray-600">{item.category}</p>
                <p className="text-gray-600">{item.foodType}</p>
                <p className="text-gray-600">{item.description}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-item/${item._id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id, shop._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
