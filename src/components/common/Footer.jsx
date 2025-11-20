import React from "react";

const Footer = () => {
  return (
    <footer className="mt-10 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
        {/* Logo + copy */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2">
             <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/zentroeat-removebg.png"
              alt="ZentroEat Logo"
              className="h-12 w-auto object-contain drop-shadow-md select-none"
            />
          </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent">
              ZentroEat
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs">
            ZentroEat brings your favourite meals from trusted restaurants,
            delivered fast with live tracking.
          </p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ZentroEat. All rights reserved.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-2 text-sm">
            Company
          </h4>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>About us</li>
            <li>Careers</li>
            <li>Partner with us</li>
            <li>Delivery with ZentroEat</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-2 text-sm">
            Support
          </h4>
          <ul className="space-y-1 text-xs text-slate-500">
            <li>Help &amp; FAQ</li>
            <li>Account</li>
            <li>Order issues</li>
            <li>Payments &amp; refunds</li>
          </ul>
        </div>

        {/* Legal + Social */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-2 text-sm">Legal</h4>
          <ul className="space-y-1 text-xs text-slate-500 mb-3">
            <li>Terms &amp; Conditions</li>
            <li>Privacy policy</li>
            <li>Refund policy</li>
          </ul>

          <h4 className="font-semibold text-slate-800 mb-2 text-sm">
            Follow us
          </h4>
          <div className="flex gap-3 text-slate-500 text-lg">
            <span>in</span>
            <span></span>
            <span>f</span>
            <span>𝕏</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
