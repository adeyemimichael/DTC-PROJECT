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
  Lock,
  ShieldCheck,
  CreditCard,
  Check,
} from "lucide-react";

// Registration steps definition
const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Account Setup" },
  { id: 3, label: "Payment" },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

    // Step 4 data
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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (validateStep1()) {
    setCurrentStep(4);
    // }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (validateStep2()) {
    setCurrentStep(3);
    // }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmitError("");

    try {
      // 1. Register User
      const authResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      const authData = await authResponse.json();
      if (!authResponse.ok)
        throw new Error(authData.error || "Failed to register.");

      // 2. Create Patient Record
      const patientResponse = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_of_birth: formData.dob,
          gender: formData.gender.toLowerCase(),
          address: formData.address,
          city: formData.city,
        }),
      });

      const patientData = await patientResponse.json();
      if (!patientResponse.ok)
        throw new Error(patientData.error || "Failed to save patient data.");

      setCurrentStep(4);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <main className="flex-1 flex flex-col justify-start items-center py-10 md:py-16 px-4 animate-page-fade ">
        {/* Step Indicator Panel */}
        <div className="w-full max-w-175 text-center mb-8">
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
        <div className="w-full max-w-165">
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

              {submitError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                  {submitError}
                </div>
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
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              {/* Payment Summary Dark Card */}
              <div className="bg-linear-to-br from-[#0f0f0f] to-[#1a1a2e] rounded-2xl p-6 md:p-8 text-white">
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

              {/* Security Notice Banner */}
              <div className="bg-[#f1f5f9]/40 border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-primary-gray leading-relaxed">
                  Your payment is secured with bank-grade encryption. The $49
                  registration fee is a one-time charge. You will never be
                  billed again unless you book a consultation.
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
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[10px] bg-primary-red hover:bg-[#c40300] text-white font-bold text-base transition-colors duration-200 cursor-pointer"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Pay & Register
                      <Lock className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
