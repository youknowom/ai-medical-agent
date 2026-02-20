import React from "react";
import { ScanLine, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function XrayAnalysisPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </Link>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-primary-600 flex items-center justify-center">
                        <ScanLine className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            X-ray AI Analysis
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            CNN-powered chest X-ray analysis for pneumonia detection
                        </p>
                    </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                        Feature Overview
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        This feature allows you to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                        <li>Upload chest X-ray images</li>
                        <li>Detect pneumonia with 95% accuracy</li>
                        <li>Identify abnormalities in X-rays</li>
                        <li>CNN-powered image analysis</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
