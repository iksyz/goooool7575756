"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function CreateQuizButton() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (status === "loading") {
            return;
        }

        if (!session) {
            setShowLoginPrompt(true);
            return;
        }

        router.push("/create-quiz");
    };

    const handleLogin = () => {
        signIn("google", { callbackUrl: "/create-quiz" });
    };

    return (
        <>
            <Button
                as={motion.a}
                href="/create-quiz"
                onClick={handleClick}
                variant="secondary"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ y: 0 }}
                className="relative overflow-hidden"
            >
                <span
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-80"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.4), rgba(37,99,235,0.3), transparent 70%)",
                    }}
                />
                <Sparkles className="h-4 w-4" />
                Create Your Own Quiz
            </Button>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setShowLoginPrompt(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md rounded-3xl border border-white/40 bg-white p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-center">
                            <div className="rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-4">
                                <LogIn className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <h2 className="mb-3 text-center text-2xl font-extrabold text-emerald-950">
                            Sign In Required
                        </h2>
                        <p className="mb-6 text-center text-sm text-emerald-950/70">
                            Please sign in with your Google account to create custom football
                            quizzes and share them with the community.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleLogin}
                                className="flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowLoginPrompt(false)}
                                className="rounded-full border border-emerald-950/10 bg-white/50 px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white/80"
                            >
                                Maybe Later
                            </button>
                        </div>

                        <p className="mt-6 text-center text-xs text-emerald-950/50">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </motion.div>
                </div>
            )}
        </>
    );
}
