import React, { useState, useEffect } from "react";
import { Package, ArrowRight, Play, Menu, XIcon, IndianRupee, Clock, AlertTriangle, MapPin, Phone, BarChart3, CheckCircle2, Shield, Zap, Target, TrendingUp, Users } from "lucide-react";
import "./style.css"

// Navigation Component
const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "How It Works", href: "#how-it-works" },
        { label: "Benefits", href: "#benefits" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-[hsl(220,70%,8%)]/95 backdrop-blur-lg shadow-lg"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">OrderzUp</span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/70 hover:text-white transition-colors font-medium"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <a href="#try-now" className="btn-secondary text-sm">
                            Check Score
                        </a>
                        <a href="#cta" className="btn-primary text-sm">
                            Book Demo
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[hsl(220,70%,8%)] border-t border-white/10">
                    <div className="px-4 py-4 space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="block text-white/70 hover:text-white transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="flex flex-col gap-3 pt-4">
                            <a href="#try-now" className="btn-secondary text-sm text-center">
                                Check Score
                            </a>
                            <a href="#cta" className="btn-primary text-sm text-center">
                                Book Demo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

// Score Card Component
const ScoreCard = () => {
    const [score, setScore] = useState(0);
    const targetScore = 847;

    useEffect(() => {
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                setScore((prev) => {
                    if (prev >= targetScore) {
                        clearInterval(interval);
                        return targetScore;
                    }
                    return prev + Math.ceil((targetScore - prev) / 10);
                });
            }, 50);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="score-card rounded-3xl p-6 lg:p-8 w-full max-w-sm float-animation">
            <div className="flex items-center justify-between mb-6">
                <span className="text-white/60 text-sm font-medium">Ecommerce Credit Score</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(142,76%,36%)]/20 text-[hsl(142,76%,36%)]">
                    Excellent
                </span>
            </div>

            <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="70"
                        stroke="hsl(220, 50%, 20%)"
                        strokeWidth="12"
                        fill="none"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="70"
                        stroke="url(#scoreGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        className="score-ring score-animate"
                    />
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(24, 95%, 53%)" />
                            <stop offset="100%" stopColor="hsl(45, 93%, 47%)" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{score}</span>
                    <span className="text-white/40 text-sm">out of 900</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Order History</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[hsl(220,50%,20%)] rounded-full overflow-hidden">
                            <div className="w-[90%] h-full bg-[hsl(142,76%,36%)] rounded-full" />
                        </div>
                        <span className="text-white font-medium">90%</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Pincode Risk</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[hsl(220,50%,20%)] rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-[hsl(24,95%,53%)] rounded-full" />
                        </div>
                        <span className="text-white font-medium">85%</span>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Phone Trust</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[hsl(220,50%,20%)] rounded-full overflow-hidden">
                            <div className="w-[95%] h-full bg-[hsl(142,76%,36%)] rounded-full" />
                        </div>
                        <span className="text-white font-medium">95%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hero Section
const HeroSection = () => {
    return (
        <section className="gradient-hero min-h-screen pt-20 lg:pt-24 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Line 234 omitted */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(24,95%,53%)] to-[hsl(24,95%,45%)] border-2 border-[hsl(220,70%,8%)]"
                                        />
                                    ))}
                                </div>
                                <span className="text-white/80 text-sm font-medium">
                                    Trusted by 500+ Indian D2C Brands
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Reduce RTO by
                            {" "}
                            <span className="text-gradient-orange">40%</span> with
                            AI-Powered Credit Scoring
                        </h1>

                        <p className="text-lg lg:text-xl text-white/60 mb-8 max-w-xl mx-auto lg:mx-0">
                            Stop losing money to failed COD deliveries. OrderzUp analyzes customer
                            behavior patterns to predict which orders will be delivered successfully.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <a href="#try-now" className="btn-primary text-lg px-8 py-4">
                                Check Score Free
                                <ArrowRight className="w-5 h-5" />
                            </a>
                            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </a>
                        </div>
                        {/* Line 271 omitted */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="stat-card">
                                <div className="text-2xl lg:text-3xl font-bold text-[hsl(24,95%,53%)] mb-1">
                                    40%
                                </div>
                                <div className="text-white/50 text-xs lg:text-sm">RTO Reduction</div>
                            </div>
                            <div className="stat-card">
                                <div className="text-2xl lg:text-3xl font-bold text-[hsl(24,95%,53%)] mb-1">
                                    2.5L+
                                </div>
                                <div className="text-white/50 text-xs lg:text-sm">Orders Analyzed</div>
                            </div>
                            <div className="stat-card">
                                <div className="text-2xl lg:text-3xl font-bold text-[hsl(24,95%,53%)] mb-1">
                                    500+
                                </div>
                                <div className="text-white/50 text-xs lg:text-sm">Happy Brands</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Score Card */}
                    <div className="flex justify-center lg:justify-end">
                        <ScoreCard />
                    </div>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    );
};

// Problem Section
const ProblemSection = () => {
    const problems = [
        {
            icon: <IndianRupee className="w-8 h-8" />,
            stat: "₹25,000 Cr",
            title: "Annual RTO Loss",
            description: "Indian D2C brands lose crores every year to returned orders",
            color: "hsl(0, 84%, 60%)",
            bgColor: "hsl(0, 100%, 95%)",
        },
        {
            icon: <Package className="w-8 h-8" />,
            stat: "30%",
            title: "Average RTO Rate",
            description: "Nearly 1 in 3 COD orders get returned to origin",
            color: "hsl(24, 95%, 53%)",
            bgColor: "hsl(24, 100%, 95%)",
        },
        {
            icon: <Clock className="w-8 h-8" />,
            stat: "15 Days",
            title: "Cash Flow Block",
            description: "Money stuck in transit and returns for weeks",
            color: "hsl(45, 93%, 47%)",
            bgColor: "hsl(45, 100%, 95%)",
        },
        {
            icon: <AlertTriangle className="w-8 h-8" />,
            stat: "Zero",
            title: "Prediction Tools",
            description: "Most brands have no way to predict risky orders",
            color: "hsl(220, 70%, 50%)",
            bgColor: "hsl(220, 100%, 95%)",
        },
    ];

    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(0,100%,95%)] text-[hsl(0,84%,60%)] text-sm font-semibold mb-4">
                        The Problem
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-[hsl(220,47%,11%)] mb-6">
                        COD is Killing Your{" "}
                        <span className="text-[hsl(0,84%,60%)]">Profit Margins</span>
                    </h2>
                    <p className="text-lg text-[hsl(220,9%,46%)] max-w-2xl mx-auto">
                        Every returned order costs you shipping both ways, packaging,
                        handling, and lost opportunity costs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {problems.map((problem, index) => (
                        <div key={index} className="problem-card">
              /* Lines 371-387 omitted */
                        </div>
                    ))}
                </div>

                {/* Founder Quote */}
                <div className="bg-[hsl(220,14%,96%)] rounded-3xl p-8 lg:p-12">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(24,95%,53%)] to-[hsl(24,95%,45%)] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            RS
                        </div>
                        <div>
              /* Lines 398-410 omitted */
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Solution Section
const SolutionSection = () => {
    const scoreThresholds = [
        {
            range: "750+",
            label: "Excellent",
            action: "Approve COD instantly",
            color: "hsl(142, 76%, 36%)",
            bgColor: "hsl(142, 76%, 95%)",
        },
        {
            range: "500-750",
            label: "Moderate",
            action: "Request partial prepaid",
            color: "hsl(45, 93%, 47%)",
            bgColor: "hsl(45, 100%, 95%)",
        },
        {
            range: "<500",
            label: "High Risk",
            action: "Prepaid only or IVR verify",
            color: "hsl(0, 84%, 60%)",
            bgColor: "hsl(0, 100%, 95%)",
        },
    ];

    const features = [
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Order History",
            description: "Analyzes past delivery success rates across all platforms",
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Pincode Analysis",
            description: "Risk scoring based on area-wise RTO patterns",
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Phone Verification",
            description: "Validates phone authenticity and reachability",
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Behavioral Signals",
            description: "Detects suspicious patterns in order behavior",
        },
    ];

    return (
        <section className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-[hsl(24,95%,53%)] text-sm font-semibold mb-4">
                        The Solution
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Introducing{" "}
                        <span className="text-gradient-orange">Ecommerce Credit Score</span>
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Just like CIBIL for finance, OrderzUp provides a trust score for
                        every customer to help you make smarter COD decisions.
                    </p>
                </div>

                {/* Score Thresholds */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {scoreThresholds.map((threshold, index) => (
                        <div
                            key={index}
                            className="glass-card rounded-2xl p-6 text-center"
                        >
              /* Lines 493-511 omitted */
                        </div>
                    ))}
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
              /* Lines 519-526 omitted */
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Try It Now Section
const TryItNowSection = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        phone: "",
        pincode: "",
        email: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.phone || formData.phone.length !== 10) {
                newErrors.phone = "Please enter a valid 10-digit phone number";
            }
        } else if (step === 2) {
            if (!formData.pincode || formData.pincode.length !== 6) {
                newErrors.pincode = "Please enter a valid 6-digit pincode";
            }
        } else if (step === 3) {
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 3) {
                setStep(step + 1);
            } else {
                setIsSubmitting(true);
                setTimeout(() => {
                    setIsSubmitting(false);
                    setIsComplete(true);
                }, 1500);
            }
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === "phone" || field === "pincode") {
            value = value.replace(/\D/g, "");
        }
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    if (isComplete) {
        return (
            <section id="try-now" className="py-20 lg:py-32 bg-[hsl(220,14%,96%)]">
                <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl p-8 lg:p-12 text-center card-shadow-xl">
                        <div className="w-20 h-20 rounded-full bg-[hsl(142,76%,95%)] flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-[hsl(142,76%,36%)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[hsl(220,47%,11%)] mb-4">
                            Score Request Submitted!
                        </h3>
                        <p className="text-[hsl(220,9%,46%)] mb-6">
                            We'll analyze the data and send you the credit score report to your
                            email within 2 minutes.
                        </p>
                        <button
                            onClick={() => {/* Lines 608-611 omitted */ }}
                            className="btn-primary"
                        >
                            Check Another Score
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="try-now" className="py-20 lg:py-32 bg-[hsl(220,14%,96%)]">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(24,100%,95%)] text-[hsl(24,95%,53%)] text-sm font-semibold mb-4">
                        Try It Now
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[hsl(220,47%,11%)] mb-4">
                        Check Any Customer's Score
                    </h2>
                    <p className="text-[hsl(220,9%,46%)]">
                        Enter customer details to get instant credit score
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-8 lg:p-12 card-shadow-xl">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s ? "bg-[hsl(24,95%,53%)] text-white" : "bg-[hsl(220,13%,91%)] text-[hsl(220,9%,46%)]"
                                    }`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    {/* Form Steps */}
                    <div className="space-y-6">
                        {step === 1 && (
                            /* Lines 667-686 omitted */
                            <></>
                        )}

                        {step === 2 && (
                            /* Lines 689-708 omitted */
                            <></>
                        )}

                        {step === 3 && (
                            /* Lines 711-729 omitted */
                            <></>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="btn-primary w-full py-4 text-lg"
                        >
              /* Lines 736-768 omitted */
                        </button>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-[hsl(220,9%,46%)] text-sm">
                        <Shield className="w-4 h-4" />
                        <span>Your data is encrypted and secure</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        {
            number: "01",
            title: "Integrate in 5 Minutes",
            description:
                "Simple API or no-code plugins for Shopify, WooCommerce, and all major platforms. Start scoring orders immediately.",
            icon: <Zap className="w-8 h-8" />,
        },
        {
            number: "02",
            title: "Score Every Order",
            description:
                "Our AI analyzes 50+ data points in real-time to generate a trust score for each customer placing a COD order.",
            icon: <BarChart3 className="w-8 h-8" />,
        },
        {
            number: "03",
            title: "Take Smart Actions",
            description:
                "Automatically approve, reject, or trigger verification based on score thresholds you define.",
            icon: <Target className="w-8 h-8" />,
        },
    ];

    return (
        <section id="how-it-works" className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(24,100%,95%)] text-[hsl(24,95%,53%)] text-sm font-semibold mb-4">
                        How It Works
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-[hsl(220,47%,11%)] mb-6">
                        Go Live in <span className="text-[hsl(24,95%,53%)]">3 Simple Steps</span>
                    </h2>
                    <p className="text-lg text-[hsl(220,9%,46%)] max-w-2xl mx-auto">
                        No complex setup required. Start reducing RTO from day one.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card">
              /* Lines 826-838 omitted */
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <a href="#cta" className="btn-primary text-lg px-8 py-4">
                        Get Started Now
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
};

// Benefits Section
const BenefitsSection = () => {
    const benefits = [
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Reduce RTO by 40%",
            description: "Identify and block high-risk orders before they ship",
        },
        {
            icon: <IndianRupee className="w-8 h-8" />,
            title: "Save ₹50+ Per Order",
            description: "Eliminate double shipping costs on failed deliveries",
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Instant Decisions",
            description: "Get credit scores in under 100ms at checkout",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Improve Customer Trust",
            description: "Reward good customers with instant COD approval",
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Fraud Protection",
            description: "Detect fake orders and repeat offenders automatically",
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Actionable Analytics",
            description: "Deep insights into your RTO patterns and trends",
        },
    ];

    return (
        <section id="benefits" className="py-20 lg:py-32 bg-[hsl(220,14%,96%)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(142,76%,95%)] text-[hsl(142,76%,36%)] text-sm font-semibold mb-4">
                        Benefits
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-[hsl(220,47%,11%)] mb-6">
                        Why Brands <span className="text-[hsl(24,95%,53%)]">Love OrderzUp</span>
                    </h2>
                    <p className="text-lg text-[hsl(220,9%,46%)] max-w-2xl mx-auto">
                        Join 500+ D2C brands already saving lakhs on RTO costs every month.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-card">
              /* Lines 906-913 omitted */
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Testimonials Section
const TestimonialsSection = () => {
    const testimonials = [
        {
            quote:
                "OrderzUp has been a game-changer for our D2C business. We reduced RTO from 32% to 18% in just 6 weeks. The ROI is incredible.",
            name: "Priya Mehta",
            role: "Founder, GlowSkin Naturals",
            avatar: "PM",
        },
        {
            quote:
                "The integration was seamless with our Shopify store. Now we confidently offer COD knowing which orders will actually be delivered.",
            name: "Vikram Joshi",
            role: "CEO, FitWear India",
            avatar: "VJ",
        },
        {
            quote:
                "We were skeptical at first, but the data doesn't lie. Our cash flow improved by 25% after implementing OrderzUp's scoring system.",
            name: "Ananya Reddy",
            role: "Operations Head, HomeDecor Plus",
            avatar: "AR",
        },
    ];

    const brands = [
        "StyleKart",
        "GlowSkin",
        "FitWear",
        "HomeDecor",
        "TechGadgets",
        "FashionHub",
        "BeautyBox",
        "HealthFirst",
    ];

    return (
        <section id="testimonials" className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(24,100%,95%)] text-[hsl(24,95%,53%)] text-sm font-semibold mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-[hsl(220,47%,11%)] mb-6">
                        Trusted by <span className="text-[hsl(24,95%,53%)]">500+ Brands</span>
                    </h2>
                    <p className="text-lg text-[hsl(220,9%,46%)] max-w-2xl mx-auto">
                        See what our customers have to say about their experience with OrderzUp.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
              /* Lines 976-1000 omitted */
                        </div>
                    ))}
                </div>

                {/* Brand Marquee */}
                <div className="overflow-hidden">
                    <div className="flex items-center gap-12 marquee">
                        {[...brands, ...brands].map((brand, index) => (
                            /* Lines 1008-1014 omitted */
                            <></>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// CTA Section
const CTASection = () => {
    return (
        <section id="cta" className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Ready to <span className="text-gradient-orange">Stop Losing Money</span> to
                        RTO?
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Join 500+ brands that have already reduced their RTO rates by up to 40%.
                        Start your free trial today.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Book Demo Card */}
                    <div className="glass-card rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[hsl(24,95%,53%)]/20 flex items-center justify-center text-[hsl(24,95%,53%)] mx-auto mb-6">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Book a Demo</h3>
                        <p className="text-white/60 mb-6">
                            Get a personalized walkthrough of OrderzUp with our team. See how it can
                            work for your business.
                        </p>
                        <a
                            href="mailto:demo@orderzup.com"
                            className="btn-primary w-full py-4 text-lg"
                        >
                            Schedule Demo
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Start Free Trial Card */}
                    <div className="glass-card rounded-3xl p-8 text-center border-[hsl(24,95%,53%)]/50">
            /* Lines 1062-1074 omitted */
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                    <div className="flex items-center gap-2 text-white/60">
                        <Shield className="w-5 h-5" />
            /* Lines 1081-1082 omitted */
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <CheckCircle2 className="w-5 h-5" />
            /* Lines 1085-1086 omitted */
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <Zap className="w-5 h-5" />
            /* Lines 1089-1090 omitted */
                    </div>
                </div>
            </div>
        </section>
    );
};

// FAQ Section
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How does the Ecommerce Credit Score work?",
            answer:
                "Our AI analyzes 50+ data points including order history, phone verification status, pincode risk levels, behavioral patterns, and more to generate a trust score between 0-900 for each customer. Higher scores indicate more reliable customers.",
        },
        {
            question: "How long does integration take?",
            answer:
                "Most brands are up and running within 5 minutes. We offer no-code plugins for Shopify, WooCommerce, Magento, and other popular platforms. For custom integrations, our API documentation makes it easy for developers.",
        },
        {
            question: "What if a good customer gets a low score?",
            answer:
                "Our system continuously learns and improves. You can whitelist specific customers, and their positive delivery history will improve their score over time. We also offer IVR verification as a fallback for borderline cases.",
        },
        {
            question: "Is my customer data safe?",
            answer:
                "Absolutely. We're SOC 2 compliant and GDPR ready. All data is encrypted in transit and at rest. We never sell or share your customer data with third parties.",
        },
        {
            question: "How much does OrderzUp cost?",
            answer:
                "We offer flexible pricing based on your order volume. Plans start at ₹2,999/month for up to 1,000 orders. We also offer a free trial with 100 score checks so you can see the impact before committing.",
        },
        {
            question: "Can I customize the score thresholds?",
            answer:
                "Yes! You have full control over what actions to take at different score levels. Set your own thresholds for auto-approval, partial prepaid requests, IVR verification, or prepaid-only requirements.",
        },
        {
            question: "Do you support all shipping carriers?",
            answer:
                "We integrate with all major Indian shipping carriers including Delhivery, BlueDart, DTDC, Ecom Express, and more. Our system works regardless of which carrier you use.",
        },
        {
            question: "What kind of support do you offer?",
            answer:
                "We offer 24/7 chat and email support. Premium plans include dedicated account managers and priority phone support. Our average response time is under 2 hours.",
        },
    ];

    return (
        <section id="faq" className="py-20 lg:py-32 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-[hsl(220,100%,95%)] text-[hsl(220,70%,50%)] text-sm font-semibold mb-4">
                        FAQ
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-bold text-[hsl(220,47%,11%)] mb-6">
                        Frequently Asked/* Lines 1152-1154 omitted */
                    </h2>
                    <p className="text-lg text-[hsl(220,9%,46%)]">
                        Everything you need to know about OrderzUp
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        /* Lines 1162-1187 omitted */
                        <></>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-[hsl(220,9%,46%)] mb-4">Still have questions?</p>
                    <a
                        href="mailto:support@orderzup.com"
                        className="text-[hsl(24,95%,53%)] font-semibold hover:underline"
                    >
                        Contact our support team →
                    </a>
                </div>
            </div>
        </section>
    );
};

// Footer Section
const Footer = () => {
    return (
        <footer className="gradient-hero py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Line 1210 omitted */}
                    <div className="md:col-span-2">
            /* Lines 1212-1240 omitted */
                    </div>

                    {/* Line 1242 omitted */}
                    <div>
            /* Lines 1244-1279 omitted */
                    </div>

                    <div>
            /* Lines 1282-1317 omitted */
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/40 text-sm">
                        © 2024 OrderzUp. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
            /* Lines 1325-1337 omitted */
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Main Index Component
const Index = () => {
    return (
        <main className="overflow-x-hidden">
            <Navigation />
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <TryItNowSection />
            <HowItWorksSection />
            <BenefitsSection />
            <TestimonialsSection />
            <CTASection />
            <FAQSection />
            <Footer />
        </main>
    );
};

export default Index;