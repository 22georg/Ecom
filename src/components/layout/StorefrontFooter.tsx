import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const StorefrontFooter: React.FC = () => {
  return (
    <footer className="bg-[var(--mq-primary)] text-white border-t border-[var(--mq-border)] mt-16">
      {/* Value Proposition Highlights */}
      <div className="border-b border-white/10 py-10 bg-white/5">
        <div className="mq-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[var(--mq-secondary)] text-white shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Intelligent Logistics</h5>
              <p className="text-xs text-slate-300 mt-1">Real-time order tracking and carbon-neutral express shipping.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[var(--mq-secondary)] text-white shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Verified Security</h5>
              <p className="text-xs text-slate-300 mt-1">End-to-end encrypted checkout and fraud protection engine.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[var(--mq-secondary)] text-white shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">30-Day Guarantee</h5>
              <p className="text-xs text-slate-300 mt-1">Hassle-free automated returns and immediate store credits.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[var(--mq-secondary)] text-white shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Dedicated Support</h5>
              <p className="text-xs text-slate-300 mt-1">Direct access to product advisors 24 hours a day, 7 days a week.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="mq-container py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">MARQIVO</span>
          </div>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            Modern commerce, intelligently connected. Built from the ground up for seamless discovery, confident purchasing, and unified catalog operations.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-semibold text-white">Subscribe to Curated Drops</label>
            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-10 px-3.5 text-xs rounded-md bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[var(--mq-secondary)] w-full"
              />
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Join
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-4">Discovery</h5>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li><a href="#" className="hover:text-white transition-colors">Catalog Overview</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Trending Hardware</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Smart Home Tech</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Minimalist Apparel</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Promotional Campaigns</a></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-4">Customer Portal</h5>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li><a href="#" className="hover:text-white transition-colors">My Account</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Order Status</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Wishlists</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Information</a></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-4">Platform Architecture</h5>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
            <li><a href="#" className="hover:text-white transition-colors">API Architecture</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Railway Deployment</a></li>
            <li><a href="#" className="hover:text-white transition-colors">System Security</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Design System</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10 py-6 text-xs text-slate-400">
        <div className="mq-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MARQIVO Commerce Platform. Built independently from requirements.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Notice</span>
            <span className="hover:text-white cursor-pointer">Security Foundation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
