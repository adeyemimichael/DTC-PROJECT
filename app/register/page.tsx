"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  Activity,
  Info,
  Lock,
  ShieldCheck,
  CreditCard,
  Check,
} from "lucide-react";

// Registration steps definition
const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Account Setup" },
  { id: 3, label: "Health Baseline" },
  { id: 4, label: "Payment" },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 data
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    address: "",
    city: "",

    // Step 2 data
    password: "",
    confirmPassword: "",
    agreeToTerms: false,

    // Step 3 data
    weight: "",
    height: "",
    heartRate: "",
    systolic: "",
    diastolic: "",

    // Step 4 data
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleGenderSelect = (gender: "Male" | "Female" | "Other") => {
    setFormData((prev) => ({ ...prev, gender }));
    if (errors.gender) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.gender;
        return next;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Residential address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};

    const isPositiveNumber = (val: string) => {
      if (!val.trim()) return true;
      const num = Number(val);
      return !isNaN(num) && num > 0;
    };

    if (formData.weight && !isPositiveNumber(formData.weight)) {
      newErrors.weight = "Please enter a valid weight";
    }

    if (formData.height && !isPositiveNumber(formData.height)) {
      newErrors.height = "Please enter a valid height";
    }

    if (formData.heartRate) {
      const hrNum = Number(formData.heartRate);
      if (isNaN(hrNum) || hrNum <= 0 || !Number.isInteger(hrNum)) {
        newErrors.heartRate = "Please enter a valid heart rate (integer)";
      }
    }

    if (formData.systolic || formData.diastolic) {
      if (!formData.systolic) {
        newErrors.systolic = "Required";
      } else if (!isPositiveNumber(formData.systolic)) {
        newErrors.systolic = "Invalid";
      }

      if (!formData.diastolic) {
        newErrors.diastolic = "Required";
      } else if (!isPositiveNumber(formData.diastolic)) {
        newErrors.diastolic = "Invalid";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      setCurrentStep(4);
    }
  };

  const validateStep4 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    const digitsOnly = formData.cardNumber.replace(/\s/g, "");
    if (!digitsOnly) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{13,19}$/.test(digitsOnly)) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate.trim())) {
      newErrors.expiryDate = "Use MM/YY format";
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = "CVC is required";
    } else if (!/^\d{3,4}$/.test(formData.cvc.trim())) {
      newErrors.cvc = "Invalid CVC";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep4()) {
      setCurrentStep(5);
    }
  };

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    handleInputChange("cardNumber", formatted);
  };

  // Format expiry date as MM/YY
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) {
      handleInputChange(
        "expiryDate",
        cleaned.slice(0, 2) + "/" + cleaned.slice(2),
      );
    } else {
      handleInputChange("expiryDate", cleaned);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col justify-start items-center py-10 md:py-16 px-4 animate-page-fade">
        {/* Step Indicator Panel */}
        <div className="w-full max-w-[700px] text-center mb-8">
          <h1 className="text-[28px] md:text-[36px] font-bold text-primary-deepblue tracking-tight leading-tight mb-2">
            Create Your Account
          </h1>
          <p className="text-[14px] md:text-[15px] text-primary-gray mb-8">
            One-time $49 registration. No subscriptions. Pay only when you book.
          </p>

          {/* Steps Progress Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] md:text-sm font-semibold select-none">
            {steps.map((s) => {
              const isActiveOrCompleted = s.id <= currentStep;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                      isActiveOrCompleted
                        ? "bg-primary-red text-white"
                        : "bg-slate-200 text-white",
                    )}
                  >
                    {s.id}
                  </span>
                  <span
                    className={cn(
                      "transition-colors duration-300 font-medium",
                      isActiveOrCompleted
                        ? "text-primary-deepblue font-bold"
                        : "text-slate-400",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Area */}
        <div className="w-full max-w-[660px]">
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Row 1: Name Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  label="First name"
                  placeholder="e.g John"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  placeholder="e.g Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  error={errors.lastName}
                />
              </div>

              {/* Row 2: Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
              />

              {/* Row 3: Phone & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+234 703 666 1092"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  error={errors.phoneNumber}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  error={errors.dob}
                  className="w-full uppercase [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  rightIcon={<Calendar className="w-5 h-5 text-slate-400" />}
                />
              </div>

              {/* Row 4: Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-primary-deepblue select-none">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(["Male", "Female", "Other"] as const).map((g) => {
                    const isSelected = formData.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGenderSelect(g)}
                        className={cn(
                          "py-3.5 px-4 text-center rounded-[10px] border font-semibold text-[15px] transition-all duration-200 cursor-pointer select-none",
                          isSelected
                            ? "bg-secondary-blue border-primary-blue text-primary-blue"
                            : "bg-white border-slate-200 text-primary-deepblue hover:border-slate-300",
                        )}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                {errors.gender && (
                  <span className="text-xs font-semibold text-primary-red mt-0.5">
                    {errors.gender}
                  </span>
                )}
              </div>

              {/* Row 5: Residential Address */}
              <Input
                label="Residential Address"
                placeholder="Street address, apartment, suite"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                error={errors.address}
              />

              {/* Row 6: City */}
              <Input
                label="City"
                placeholder="e.g Lagos"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                error={errors.city}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* Create Password */}
              <Input
                label="Create Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                error={errors.password}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                error={errors.confirmPassword}
              />

              {/* Agreement Banner Card */}
              <div className="bg-[#f1f5f9]/60 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleCheckboxChange("agreeToTerms", e.target.checked)
                    }
                    className="w-4 h-4 rounded text-primary-blue border-slate-300 focus:ring-primary-blue cursor-pointer"
                  />
                </div>
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-primary-gray leading-relaxed cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <Link
                    href="#terms"
                    className="text-primary-blue font-semibold hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#privacy"
                    className="text-primary-blue font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that my health information will be handled in
                  accordance with HIPAA regulations.
                </label>
              </div>
              {errors.agreeToTerms && (
                <span className="text-xs font-semibold text-primary-red block -mt-4">
                  {errors.agreeToTerms}
                </span>
              )}

              {/* Navigation Buttons Row */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-none px-6 py-4 rounded-[10px] border border-slate-200 text-primary-deepblue font-bold text-base hover:bg-slate-50 transition-colors duration-200 cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              {/* Top Vital Track Info Card */}
              <div className="bg-[#f1f5f9]/40 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Activity className="w-5 h-5 text-primary-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-primary-deepblue mb-1">
                    Track Your Health from Day One
                  </h3>
                  <p className="text-xs text-[#404245] leading-relaxed">
                    Recording your baseline vitals helps Dr. Adeyemi provide
                    better, more personalized care. We encourage all patients to
                    invest in a bathroom scale, tape measure, digital
                    thermometer, and digital BP apparatus for at-home
                    monitoring. These simple tools empower you to track your
                    health between visits.
                  </p>
                </div>
              </div>

              {/* Baseline Measurements Section */}
              <div className="pt-2">
                <h2 className="text-[17px] font-bold text-primary-deepblue">
                  Baseline Measurements
                </h2>
                <p className="text-[13px] text-slate-400 mt-1">
                  These will be recorded once at registration. You'll update
                  current vitals each time you book a consultation.
                </p>
              </div>

              {/* Row 1: Weight & Height Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <Input
                    label="Weight (kg)"
                    placeholder="e.g 72"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    error={errors.weight}
                  />
                  <p className="text-[12px] text-slate-400 mt-1.5 ml-1">
                    Use a bathroom scale
                  </p>
                </div>
                <div>
                  <Input
                    label="Height (meters)"
                    placeholder="e.g 1.72"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    error={errors.height}
                  />
                  <p className="text-[12px] text-slate-400 mt-1.5 ml-1">
                    Use a tape measure
                  </p>
                </div>
              </div>

              {/* Row 2: Heart Rate */}
              <div>
                <Input
                  label="Resting Heart Rate (bpm)"
                  placeholder="e.g 72"
                  value={formData.heartRate}
                  onChange={(e) =>
                    handleInputChange("heartRate", e.target.value)
                  }
                  error={errors.heartRate}
                />
                <p className="text-[12px] text-slate-400 mt-1.5 ml-1">
                  Count your pulse for 60 seconds at rest
                </p>
              </div>

              {/* Row 3: Blood Pressure split fields */}
              <div>
                <label className="text-[15px] font-semibold text-primary-deepblue select-none block mb-2">
                  Blood Pressure (mmHg)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Systolic"
                    value={formData.systolic}
                    onChange={(e) =>
                      handleInputChange("systolic", e.target.value)
                    }
                    error={errors.systolic}
                  />
                  <span className="text-xl text-slate-300">/</span>
                  <Input
                    placeholder="Diastolic"
                    value={formData.diastolic}
                    onChange={(e) =>
                      handleInputChange("diastolic", e.target.value)
                    }
                    error={errors.diastolic}
                  />
                </div>
                <p className="text-[12px] text-slate-400 mt-1.5 ml-1">
                  Use a digital BP apparatus
                </p>
              </div>

              {/* Bottom skippable message banner */}
              <div className="bg-[#f1f5f9]/40 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-[#404245] leading-relaxed">
                  Don't have these devices yet? No worries — you can skip this
                  step and update your vitals later from your dashboard.
                  However, having accurate baseline measurements helps us
                  provide the best possible care from your very first visit.
                </p>
              </div>

              {/* Navigation Buttons Row */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-none px-6 py-4 rounded-[10px] border border-slate-200 text-primary-deepblue font-bold text-base hover:bg-slate-50 transition-colors duration-200 cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 4 && (
            <form onSubmit={handleStep4Submit} className="space-y-6">
              {/* Payment Summary Dark Card */}
              <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a2e] rounded-2xl p-6 md:p-8 text-white">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">
                  Payment Summary
                </p>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Durom&apos;s Touch Clinic
                    </h3>
                    <p className="text-[13px] text-slate-400">
                      Patient Account Registration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[28px] font-bold text-white leading-tight">
                      $49.00
                    </p>
                    <p className="text-[12px] text-slate-400">One-time fee</p>
                  </div>
                </div>

                {/* Summary Rows */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-slate-400">Patient</span>
                    <span className="text-[13px] font-semibold text-white">
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-slate-400">Email</span>
                    <span className="text-[13px] font-semibold text-white">
                      {formData.email || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-slate-400">Phone</span>
                    <span className="text-[13px] font-semibold text-white">
                      {formData.phoneNumber || "—"}
                    </span>
                  </div>
                  {formData.weight && (
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-slate-400">Weight</span>
                      <span className="text-[13px] font-semibold text-white">
                        {formData.weight} kg
                      </span>
                    </div>
                  )}
                  {formData.systolic && formData.diastolic && (
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-slate-400">BP</span>
                      <span className="text-[13px] font-semibold text-white">
                        {formData.systolic}/{formData.diastolic} mmHg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Selector Card */}
              <div>
                <h2 className="text-[17px] font-bold text-primary-deepblue mb-3">
                  Payment Method
                </h2>
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary-deepblue" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-primary-deepblue">
                        Credit / Debit Card
                      </p>
                      <p className="text-[12px] text-slate-400">
                        Selected Payment Method
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Card Input Fields */}
              <Input
                label="Cardholder Name"
                placeholder="Name on card"
                value={formData.cardholderName}
                onChange={(e) =>
                  handleInputChange("cardholderName", e.target.value)
                }
                error={errors.cardholderName}
              />

              <Input
                label="Card Number"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                error={errors.cardNumber}
                maxLength={19}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  error={errors.expiryDate}
                  maxLength={5}
                />
                <Input
                  label="CVC"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) =>
                    handleInputChange(
                      "cvc",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  error={errors.cvc}
                  maxLength={4}
                />
              </div>

              {/* Security Notice Banner */}
              <div className="bg-[#f1f5f9]/40 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-[#404245] leading-relaxed">
                  Your payment is secured with bank-grade encryption. The $49
                  registration fee is a one-time charge. You will never be
                  billed again unless you book a consultation.
                </p>
              </div>

              {/* Navigation Buttons Row */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-none px-6 py-4 rounded-[10px] border border-slate-200 text-primary-deepblue font-bold text-base hover:bg-slate-50 transition-colors duration-200 cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  Pay & Register
                  <Lock className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 5 && (
            <div className="text-center py-12 px-6 md:px-10 bg-white w-full max-w-140 mx-auto">
              <div className="w-16 h-16 bg-[#edf2fa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-[#2e5bf0]" strokeWidth={2.5} />
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold text-primary-deepblue mb-3 tracking-tight">
                Registration Complete
              </h2>
              <p className="text-[15px] text-[#404245] mb-8 leading-relaxed max-w-140 mx-auto">
                Welcome to Durom&apos;s Touch Clinic! Your account has been
                created successfully. A confirmation email has been sent to{" "}
                <span className="font-semibold text-primary-deepblue">
                  {formData.email || "f@gmail.com"}
                </span>
                .
              </p>

              <div className="border border-slate-200 rounded-[16px] py-8 px-4 mb-8">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-4">
                  PAYMENT PROCESSED
                </p>
                <p className="text-[32px] font-bold text-primary-deepblue leading-tight mb-1">
                  $49.00
                </p>
                <p className="text-[13px] text-slate-400">
                  One-time registration fee
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="w-full">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-[15px] transition-colors duration-200 cursor-pointer"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link
                  href="/"
                  className="text-[14px] font-medium text-[#404245] hover:text-primary-deepblue hover:underline py-2"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Header = () => {
  return (
    <header className="w-full bg-white border-b border-slate-100 flex h-20 items-center">
      <div className="container-brand flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Durom's Touch Clinic Logo"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex flex-row items-center gap-2 text-sm font-medium text-primary-gray">
          <p>Already have an account?</p>
          <Link
            href="#login"
            className="text-primary-blue font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Register;
