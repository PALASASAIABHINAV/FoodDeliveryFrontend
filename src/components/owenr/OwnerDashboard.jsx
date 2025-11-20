import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "../../store/useShopStore";
import { useItemStore } from "../../store/useItemStore";
import { useUserStore } from "../../store/useAuthStore";

import Navbar from "../common/Navbar";
import OwnerVerificationForm from "./OwnerVerificationForm";

import {
  Store,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import OwnerVerificationPending from "./OwnerVerificationPending";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const { user, loading: userLoading } = useUserStore();
  const { shop, loading: shopLoading, fetchMyShop } = useShopStore();
  const {
    items,
    loading: itemLoading,
    fetchItemsByShop,
    deleteItem,
  } = useItemStore();

  // Fetch shop on mount
  useEffect(() => {
    fetchMyShop();
  }, [fetchMyShop]);

  // Fetch items when shop is available
  useEffect(() => {
    if (shop?._id) {
      fetchItemsByShop(shop._id);
    }
  }, [shop, fetchItemsByShop]);

    // ✅ Read "pending" status from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag =
        localStorage.getItem("zentro_owner_request_status") === "PENDING";
      setHasPendingRequest(flag);
    }
  }, []);

  // ✅ If admin has approved (backend set isVerifiedOwner = true), clear pending flag
  useEffect(() => {
    if (user?.isVerifiedOwner && typeof window !== "undefined") {
      localStorage.removeItem("zentro_owner_request_status");
      setHasPendingRequest(false);
    }
  }, [user?.isVerifiedOwner]);


  // While user is loading
  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  // If owner is NOT verified → show verification flow (unchanged logic)
    // ✅ If owner is NOT verified → either show form or waiting page
  if (user.role === "owner" && !user.isVerifiedOwner) {
    if (hasPendingRequest) {
      // Form already submitted, waiting for admin
      return <OwnerVerificationPending />;
    }
    // No request yet → show verification form
    return <OwnerVerificationForm />;
  }


  // Shop loading
  if (shopLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading shop details…</p>
          </div>
        </div>
      </div>
    );
  }

  // No shop yet → empty state
  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center">
          <div className="bg-white/90 border border-slate-100 rounded-2xl shadow-lg p-8 w-full text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Store className="w-7 h-7 text-emerald-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              You don’t have a restaurant yet
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Create your restaurant profile to start listing your dishes and
              receiving orders on ZentroEat.
            </p>

            <button
              onClick={() => navigate("/create-shop")}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add my restaurant
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Derived stats from items (front-end only, same backend data)
  const totalItems = items?.length || 0;
  const availableItems = items?.filter((i) => i.isAvailable !== false).length;
  const unavailableItems = totalItems - availableItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
              Restaurant owner
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              My Restaurant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your restaurant details and menu items in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/edit-shop")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit restaurant
            </button>
            <button
              onClick={() => navigate("/add-item")}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add new item
            </button>
          </div>
        </header>

        {/* Shop card + stats */}
        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] gap-4 mb-8">
          {/* Shop info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                src={shop?.image?.url}
                alt={shop?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {shop?.name}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {shop?.address}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {shop?.city}, {shop?.state}
              </p>
              {shop?.createdAt && (
                <p className="mt-2 text-[11px] text-slate-400">
                  On ZentroEat since{" "}
                  {new Date(shop.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5">
              <p className="text-[11px] text-slate-500">Total items</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {totalItems}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5">
              <p className="text-[11px] text-slate-500">Available</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {availableItems}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5">
              <p className="text-[11px] text-slate-500">Not available</p>
              <p className="text-xl font-bold text-rose-500 mt-1">
                {unavailableItems}
              </p>
            </div>
          </div>
        </section>

        {/* Items section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Menu items
            </h3>
            <p className="text-[11px] text-slate-500">
              Click “Edit” to update price, availability or details.
            </p>
          </div>

          {itemLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-sm text-slate-500">
              Loading items…
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
              <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No items added yet
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Start adding dishes to make your restaurant visible to
                customers.
              </p>
              <button
                onClick={() => navigate("/add-item")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
                Add first item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const isAvailable = item.isAvailable !== false; // default true if field missing
                const hasRating =
                  typeof item.avgRating === "number" &&
                  item.avgRating > 0 &&
                  typeof item.totalReviews === "number";

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="h-32 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.image?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3.5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.category} • {item.foodType}
                          </p>
                        </div>

                        {/* Availability pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {isAvailable ? "Available" : "Not available"}
                        </span>
                      </div>

                      {/* Price + rating */}
                      <div className="flex items-center justify-between text-xs mt-1">
                        <p className="font-semibold text-slate-900">
                          ₹{item.price}
                        </p>
                        {hasRating && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[11px] font-semibold text-slate-800">
                              {item.avgRating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({item.totalReviews})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-3.5 pb-3.5 pt-0 flex gap-2">
                      <button
                        onClick={() => navigate(`/edit-item/${item._id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${item.name}" from your menu?`
                            )
                          ) {
                            deleteItem(item._id, shop._id);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;
