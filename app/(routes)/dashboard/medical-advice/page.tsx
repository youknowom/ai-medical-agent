import React from "react";
import { Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MedicalAdvicePage() {
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
                        <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            Medical Advice Hub
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Personalized recommendations and doctor suggestions
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
                        <li>Get personalized medical advice</li>
                        <li>Receive doctor recommendations</li>
                        <li>Access treatment guidance</li>
                        <li>AI-powered health insights</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
