/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUpload,
  faImage,
  faTimes,
  faGlobe,
  faUserDoctor,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faMap,
  faExternalLinkAlt,
  faBuilding,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faYoutube,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { getAppInfo, updateAppInfo } from "@api/appInfo.api";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Spinner from "@components/ui/Spinner";
import { toast } from "sonner";

/**
 * Tab configuration
 * @constant {Array<{id: string, label: string, icon: Object}>}
 */
const TABS = [
  { id: "general", label: "General Info", icon: faInfoCircle },
  { id: "media", label: "Media & Images", icon: faImage },
  { id: "social", label: "Social Links", icon: faGlobe },
  { id: "clinic", label: "Clinic Info", icon: faBuilding },
];

/**
 * Social platform configuration
 * @constant {Array<{key: string, label: string, icon: Object, color: string, placeholder: string}>}
 */
const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: faFacebook,
    color: "text-[#1877F2]",
    bgColor: "bg-[#1877F2]/10",
    placeholder: "https://facebook.com/your-page",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: faTwitter,
    color: "text-[#1DA1F2]",
    bgColor: "bg-[#1DA1F2]/10",
    placeholder: "https://twitter.com/your-handle",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: faLinkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
    placeholder: "https://linkedin.com/in/your-profile",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: faYoutube,
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]/10",
    placeholder: "https://youtube.com/@your-channel",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: faInstagram,
    color: "text-[#E4405F]",
    bgColor: "bg-[#E4405F]/10",
    placeholder: "https://instagram.com/your-handle",
  },
];

/**
 * AppInfoPage - Application information settings (ADMIN only)
 *
 * Features:
 * - 4 tabbed sections (General, Media, Social, Clinic)
 * - Animated tab indicator with layoutId
 * - Dirty state tracking for unsaved changes
 * - Floating save bar that appears when changes are made
 * - Image upload zones with preview
 * - Social link validation
 * - Map embed preview
 * - Character counters on textareas
 */
function AppInfoPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const initialDataRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({});
  const [doctorImage, setDoctorImage] = useState(null);
  const [doctorImagePreview, setDoctorImagePreview] = useState("");
  const [ogImage, setOgImage] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState("");
  const doctorImageInputRef = useRef(null);
  const ogImageInputRef = useRef(null);

  /**
   * Fetch current app info
   */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["app-info"],
    queryFn: getAppInfo,
    staleTime: 10 * 60 * 1000,
  });

  /**
   * Update mutation
   */
  const mutation = useMutation({
    mutationFn: updateAppInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-info"] });
      toast.success("App info updated successfully");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update app info",
      );
    },
  });

  /**
   * Initialize form data when API response arrives
   */
  useEffect(() => {
    if (data?.data && !initialDataRef.current) {
      const appInfo = data.data;
      const initial = {
        siteName: appInfo.siteName || "",
        siteDescription: appInfo.siteDescription || "",
        doctorName: appInfo.doctorName || "",
        doctorTitle: appInfo.doctorTitle || "",
        doctorSpecialty: appInfo.doctorSpecialty || "",
        doctorBio: appInfo.doctorBio || "",
        email: appInfo.email || "",
        phone: appInfo.phone || "",
        address: appInfo.address || "",
        socialLinks: {
          facebook: appInfo.socialLinks?.facebook || "",
          twitter: appInfo.socialLinks?.twitter || "",
          linkedin: appInfo.socialLinks?.linkedin || "",
          youtube: appInfo.socialLinks?.youtube || "",
          instagram: appInfo.socialLinks?.instagram || "",
        },
        clinicHours: appInfo.clinicHours || "",
        mapEmbedUrl: appInfo.mapEmbedUrl || "",
      };
      setFormData(initial);
      initialDataRef.current = initial;
      setDoctorImagePreview(appInfo.doctorImage?.url || "");
      setOgImagePreview(appInfo.ogImage?.url || "");
    }
  }, [data]);

  /**
   * Check for dirty fields by comparing current formData with initial
   */
  const checkDirty = useCallback((currentData) => {
    if (!initialDataRef.current) return false;

    const initial = initialDataRef.current;

    // Check top-level fields
    const topLevelKeys = [
      "siteName",
      "siteDescription",
      "doctorName",
      "doctorTitle",
      "doctorSpecialty",
      "doctorBio",
      "email",
      "phone",
      "address",
      "clinicHours",
      "mapEmbedUrl",
    ];
    for (const key of topLevelKeys) {
      if (currentData[key] !== initial[key]) return true;
    }

    // Check social links
    if (currentData.socialLinks && initial.socialLinks) {
      for (const key of [
        "facebook",
        "twitter",
        "linkedin",
        "youtube",
        "instagram",
      ]) {
        if (currentData.socialLinks[key] !== initial.socialLinks[key])
          return true;
      }
    }

    return false;
  }, []);

  /**
   * Handle form field change
   */
  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        let updated;
        if (field.startsWith("socialLinks.")) {
          const key = field.split(".")[1];
          updated = {
            ...prev,
            socialLinks: { ...prev.socialLinks, [key]: value },
          };
        } else {
          updated = { ...prev, [field]: value };
        }
        setHasChanges(
          checkDirty(updated) || doctorImage !== null || ogImage !== null,
        );
        return updated;
      });
    },
    [checkDirty, doctorImage, ogImage],
  );

  /**
   * Handle doctor image upload
   */
  const handleDoctorImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setDoctorImage(file);
    setDoctorImagePreview(URL.createObjectURL(file));
    setHasChanges(true);
  }, []);

  /**
   * Handle OG image upload
   */
  const handleOgImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setOgImage(file);
    setOgImagePreview(URL.createObjectURL(file));
    setHasChanges(true);
  }, []);

  /**
   * Handle save - build payload with only changed fields
   */
  const handleSave = () => {
    const initial = initialDataRef.current;
    let hasAnyChanges = false;

    // Use FormData to support image uploads
    const formDataToSend = new FormData();

    // Compare and append changed top-level fields
    const topLevelKeys = [
      "siteName",
      "siteDescription",
      "doctorName",
      "doctorTitle",
      "doctorSpecialty",
      "doctorBio",
      "email",
      "phone",
      "address",
      "clinicHours",
      "mapEmbedUrl",
    ];
    for (const key of topLevelKeys) {
      if (formData[key] !== initial[key]) {
        formDataToSend.append(key, formData[key] || "");
        hasAnyChanges = true;
      }
    }

    // Compare social links - send as individual fields
    const socialKeys = [
      "facebook",
      "twitter",
      "linkedin",
      "youtube",
      "instagram",
    ];
    for (const key of socialKeys) {
      if (formData.socialLinks[key] !== initial.socialLinks[key]) {
        formDataToSend.append(
          `socialLinks[${key}]`,
          formData.socialLinks[key] || "",
        );
        hasAnyChanges = true;
      }
    }

    // Append images if new files were selected
    if (doctorImage) {
      formDataToSend.append("doctorImage", doctorImage);
      hasAnyChanges = true;
    }
    if (ogImage) {
      formDataToSend.append("ogImage", ogImage);
      hasAnyChanges = true;
    }

    // If no changes at all
    if (!hasAnyChanges) {
      toast.info("No changes to save");
      return;
    }

    mutation.mutate(formDataToSend);
  };

  /**
   * URL validation helper
   */
  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Failed to load settings</h2>
        <Button
          variant="primary"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["app-info"] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20"
    >
      <PageHeader
        title="App Info Settings"
        subtitle="Manage your application information and branding"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "App Info", active: true },
        ]}
      />

      {/* ========== TABS ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-border-light dark:border-border-dark scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "text-brand-primary"
                    : "text-text-para-light dark:text-text-para-dark hover:text-text-heading-light dark:hover:text-text-heading-dark"
                }
              `}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="appInfoTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {/* ========== TAB 1: GENERAL INFO ========== */}
              {activeTab === "general" && (
                <div className="space-y-5 max-w-2xl">
                  <Input
                    label="Site Name"
                    value={formData.siteName || ""}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                    placeholder="Dr. Sahidur Rahman Khan"
                    leftIcon={faGlobe}
                    disabled={mutation.isPending}
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={formData.siteDescription || ""}
                      onChange={(e) =>
                        handleChange("siteDescription", e.target.value)
                      }
                      placeholder="Brief description of the website"
                      maxLength={500}
                      rows={3}
                      disabled={mutation.isPending}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                    />
                    <p className="text-[10px] text-text-para-light mt-0.5 text-right">
                      {(formData.siteDescription || "").length}/500
                    </p>
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-5">
                    <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUserDoctor}
                        className="w-4 h-4 text-brand-primary"
                      />
                      Doctor Information
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Doctor Name"
                        value={formData.doctorName || ""}
                        onChange={(e) =>
                          handleChange("doctorName", e.target.value)
                        }
                        placeholder="Dr. Md. Sahidur Rahman Khan"
                        disabled={mutation.isPending}
                      />
                      <Input
                        label="Doctor Title"
                        value={formData.doctorTitle || ""}
                        onChange={(e) =>
                          handleChange("doctorTitle", e.target.value)
                        }
                        placeholder="Orthopedic Surgeon"
                        disabled={mutation.isPending}
                      />
                      <Input
                        label="Doctor Specialty"
                        value={formData.doctorSpecialty || ""}
                        onChange={(e) =>
                          handleChange("doctorSpecialty", e.target.value)
                        }
                        placeholder="Orthopedic Surgery"
                        disabled={mutation.isPending}
                      />
                      <div>
                        <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
                          Doctor Bio
                        </label>
                        <textarea
                          value={formData.doctorBio || ""}
                          onChange={(e) =>
                            handleChange("doctorBio", e.target.value)
                          }
                          placeholder="Professional biography of the doctor"
                          maxLength={5000}
                          rows={6}
                          disabled={mutation.isPending}
                          className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                        />
                        <p className="text-[10px] text-text-para-light mt-0.5 text-right">
                          {(formData.doctorBio || "").length}/5000
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-5">
                    <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="contact@domain.com"
                        leftIcon={faEnvelope}
                        disabled={mutation.isPending}
                      />
                      <Input
                        label="Phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                        leftIcon={faPhone}
                        disabled={mutation.isPending}
                      />
                      <Input
                        label="Address"
                        value={formData.address || ""}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        placeholder="Dhaka, Bangladesh"
                        leftIcon={faMapMarkerAlt}
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB 2: MEDIA & IMAGES ========== */}
              {activeTab === "media" && (
                <div className="space-y-6 max-w-2xl">
                  {/* Doctor Image */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-3">
                      Doctor Image
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Preview */}
                      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-600 shadow-md">
                        {doctorImagePreview ? (
                          <img
                            src={doctorImagePreview}
                            alt="Doctor"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUserDoctor}
                            className="w-10 h-10 text-gray-400"
                          />
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-sm text-text-para-light dark:text-text-para-dark mb-3">
                          Upload a professional photo of the doctor
                        </p>
                        <div className="flex gap-2 justify-center sm:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => doctorImageInputRef.current?.click()}
                            leftIcon={faUpload}
                          >
                            {doctorImagePreview
                              ? "Replace Image"
                              : "Upload Image"}
                          </Button>
                          {doctorImagePreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDoctorImage(null);
                                setDoctorImagePreview("");
                                setHasChanges(true);
                              }}
                              leftIcon={faTimes}
                              className="text-red-500"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-text-para-light mt-2">
                          JPG, PNG, WebP (max 5MB)
                        </p>
                      </div>
                      <input
                        ref={doctorImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleDoctorImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* OG Image */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-3">
                      Social Sharing Image (OG Image)
                    </h3>
                    <p className="text-xs text-text-para-light dark:text-text-para-dark mb-3">
                      Used for social media sharing previews. 1200×630px
                      recommended.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Preview */}
                      <div className="w-full sm:w-64 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {ogImagePreview ? (
                          <img
                            src={ogImagePreview}
                            alt="OG Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <FontAwesomeIcon
                              icon={faImage}
                              className="w-8 h-8 text-gray-400 mb-1"
                            />
                            <p className="text-[10px] text-gray-400">
                              1200 × 630 px
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex gap-2 justify-center sm:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => ogImageInputRef.current?.click()}
                            leftIcon={faUpload}
                          >
                            {ogImagePreview ? "Replace Image" : "Upload Image"}
                          </Button>
                          {ogImagePreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setOgImage(null);
                                setOgImagePreview("");
                                setHasChanges(true);
                              }}
                              leftIcon={faTimes}
                              className="text-red-500"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-text-para-light mt-2">
                          JPG, PNG, WebP (max 5MB) • 1200×630px recommended
                        </p>
                      </div>
                      <input
                        ref={ogImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========== TAB 3: SOCIAL LINKS ========== */}
              {activeTab === "social" && (
                <div className="space-y-4 max-w-2xl">
                  <p className="text-sm text-text-para-light dark:text-text-para-dark mb-2">
                    Add links to your social media profiles. Leave empty to
                    hide.
                  </p>
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const value = formData.socialLinks?.[platform.key] || "";
                    const isValid = isValidUrl(value);
                    return (
                      <div
                        key={platform.key}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        {/* Platform Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <FontAwesomeIcon
                            icon={platform.icon}
                            className={`w-5 h-5 ${platform.color}`}
                          />
                        </div>
                        {/* Input */}
                        <div className="flex-1 relative">
                          <input
                            type="url"
                            value={value}
                            onChange={(e) =>
                              handleChange(
                                `socialLinks.${platform.key}`,
                                e.target.value,
                              )
                            }
                            placeholder={platform.placeholder}
                            disabled={mutation.isPending}
                            className={`w-full pl-3 pr-8 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 transition-all ${
                              value && !isValid
                                ? "border-red-400 focus:ring-red-400"
                                : "border-border-light dark:border-border-dark"
                            }`}
                          />
                          {value && (
                            <button
                              onClick={() =>
                                handleChange(`socialLinks.${platform.key}`, "")
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label={`Clear ${platform.label} URL`}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="w-3 h-3"
                              />
                            </button>
                          )}
                        </div>
                        {value && isValid && (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:text-brand-hover flex-shrink-0"
                            aria-label={`Open ${platform.label}`}
                          >
                            <FontAwesomeIcon
                              icon={faExternalLinkAlt}
                              className="w-3.5 h-3.5"
                            />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ========== TAB 4: CLINIC INFO ========== */}
              {activeTab === "clinic" && (
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <label className=" text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="w-4 h-4 text-brand-primary"
                      />
                      Clinic Hours
                    </label>
                    <textarea
                      value={formData.clinicHours || ""}
                      onChange={(e) =>
                        handleChange("clinicHours", e.target.value)
                      }
                      placeholder="Saturday to Thursday: 9:00 AM - 5:00 PM&#10;Friday: Closed"
                      maxLength={1000}
                      rows={4}
                      disabled={mutation.isPending}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                    />
                    <p className="text-[10px] text-text-para-light mt-0.5 text-right">
                      {(formData.clinicHours || "").length}/1000
                    </p>
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-5">
                    <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2 items-center gap-2">
                      <FontAwesomeIcon
                        icon={faMap}
                        className="w-4 h-4 text-brand-primary"
                      />
                      Map Embed URL
                    </label>
                    <input
                      type="url"
                      value={formData.mapEmbedUrl || ""}
                      onChange={(e) =>
                        handleChange("mapEmbedUrl", e.target.value)
                      }
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      disabled={mutation.isPending}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                    />

                    {/* Map Preview */}
                    {formData.mapEmbedUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 rounded-xl overflow-hidden border border-border-light dark:border-border-dark"
                      >
                        <div className="aspect-video">
                          <iframe
                            src={formData.mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Clinic Location Map"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ========== FLOATING SAVE BAR ========== */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark shadow-2xl px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  You have unsaved changes
                </p>
                <p className="text-xs text-text-para-light dark:text-text-para-dark">
                  Click save to update your app information
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({ ...initialDataRef.current });
                    setDoctorImage(null);
                    setDoctorImagePreview(data?.data?.doctorImage?.url || "");
                    setOgImage(null);
                    setOgImagePreview(data?.data?.ogImage?.url || "");
                    setHasChanges(false);
                  }}
                  disabled={mutation.isPending}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  loading={mutation.isPending}
                  disabled={mutation.isPending}
                  leftIcon={faSave}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AppInfoPage;
