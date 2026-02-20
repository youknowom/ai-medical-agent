import React from "react";
import PricingComparison from "@/app/_components/PricingComparison";
import { GraduationCap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Billing() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4">
            Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Simple, honest pricing for everyone
          </p>
        </div>

        {/* Academic Use Banner */}
        <div className="mb-8 sm:mb-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-5 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">
                  All Features Are Currently Free for Academic Use
                </h2>
                <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mb-3 sm:mb-4">
                  We&apos;re proud to support education and research. All features of our AI Medical Voice Agent platform are completely free for students, researchers, and academic institutions.
                </p>
                <div className="space-y-2">
                  {[
                    "Unlimited access to all 5 ML features",
                    "Consultations with all 10 specialist doctors",
                    "No credit card required",
                    "Full API access for research purposes",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Comparison Section */}
        <div className="mb-8 sm:mb-12">
          <PricingComparison />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-5 sm:mb-6">
              Start using all features for free today. No setup fees, no hidden costs.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                Go to Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
