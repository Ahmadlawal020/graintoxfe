import React, { useState, useRef, useCallback } from "react";
import { User, ShieldCheck, Mail, Phone, MapPin, ArrowLeft, Camera, Upload, AlertCircle, CheckCircle2, X, Loader2, RefreshCw } from "lucide-react";
import Webcam from "react-webcam";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useSubmitKycMutation, useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const UserSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, firstName, lastName, email, status: roleStatus } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || "");
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation();
  
  const kycStatus = userData?.kycStatus || "PENDING";
  const [activeTab, setActiveTab] = useState("profile");

  // KYC States
  const [docType, setDocType] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentBackFile, setDocumentBackFile] = useState<File | null>(null);
  const [documentBackPreview, setDocumentBackPreview] = useState<string | null>(null);
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back" | "selfie">("front");
  const [kycStep, setKycStep] = useState(1);

  const webcamRef = useRef<Webcam>(null);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === "front") {
          setDocumentFile(file);
          setDocumentPreview(reader.result as string);
        } else {
          setDocumentBackFile(file);
          setDocumentBackPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      if (cameraType === "front") {
        setDocumentPreview(imageSrc);
        // Convert base64 to file-like object for cloudinary util if needed, 
        // but my cloudinary util handles strings too.
      } else if (cameraType === "back") {
        setDocumentBackPreview(imageSrc);
      } else {
        setLivePhoto(imageSrc);
      }
      setIsCameraOpen(false);
    }
  }, [webcamRef, cameraType]);

  const handleSubmitKyc = async () => {
    if (!id || !docType || !documentFile || !livePhoto) {
      toast({
        title: "Missing Information",
        description: "Please complete all verification steps.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({ title: "Uploading...", description: "Uploading your verification documents." });
      
      const docUpload = await uploadToCloudinary(documentPreview!);
      const photoUpload = await uploadToCloudinary(livePhoto!);
      
      let docBackUrl = "";
      if (docType !== "International Passport" && documentBackPreview) {
        const docBackUpload = await uploadToCloudinary(documentBackPreview);
        docBackUrl = docBackUpload.secure_url;
      }

      await submitKyc({
        id,
        data: {
          kycDocType: docType,
          kycDocumentUrl: docUpload.secure_url,
          kycDocumentBackUrl: docBackUrl,
          kycLivePhotoUrl: photoUpload.secure_url,
        },
      }).unwrap();

      toast({
        title: "KYC Submitted",
        description: "Your documents have been submitted and are now under review.",
      });
    } catch (error) {
      console.error("KYC Submission Error:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit KYC. Please try again.",
        variant: "destructive"
      });
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "kyc", label: "KYC", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-1 sm:p-2">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/user")} className="mb-1 -ml-2 text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Manage your account details and verification status</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Tab Navigation - horizontal on mobile, vertical on desktop */}
        <div className="lg:col-span-1">
          {/* Mobile: Horizontal tabs */}
          <div className="flex lg:hidden gap-2">
            {tabs.map(tab => (
              <Button 
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`flex-1 gap-2 ${activeTab === tab.id ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                size="sm"
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </Button>
            ))}
          </div>
          {/* Desktop: Vertical tabs */}
          <div className="hidden lg:flex flex-col gap-2">
            {tabs.map(tab => (
              <Button 
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"} 
                className={`w-full justify-start gap-2 ${activeTab === tab.id ? "bg-emerald-600" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" /> {tab.label === "Profile" ? "Personal Profile" : "KYC Verification"}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === "profile" ? (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                {/* Profile header */}
                <CardHeader className="bg-emerald-600 text-white pb-6 sm:pb-10">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-2xl sm:text-3xl font-black">
                        {firstName?.charAt(0)}{lastName?.charAt(0)}
                      </div>
                      <button className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-white rounded-full text-emerald-600 shadow-lg">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold">{firstName} {lastName}</h2>
                      <div className="text-emerald-100 flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-white border-white/50 text-[10px]">{roleStatus}</Badge>
                        <span className="text-[10px] sm:text-xs opacity-80">User ID: GRN-U-4022</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input value={email} disabled className="pl-10 h-10 sm:h-auto text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input defaultValue="+234 812 345 6789" className="pl-10 h-10 sm:h-auto text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input defaultValue="Lere LGA, Kaduna State" className="pl-10 h-10 sm:h-auto text-sm" />
                        </div>
                      </div>
                      <div className="pt-2 sm:pt-6">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 sm:h-auto">Save Changes</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">KYC Verification</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Government regulations require verification to enable withdrawals.</CardDescription>
                    </div>
                    <Badge className={`${
                      kycStatus === "VERIFIED" ? "bg-emerald-500" : 
                      kycStatus === "UNDER_REVIEW" ? "bg-amber-500" : 
                      kycStatus === "REJECTED" ? "bg-red-500" : "bg-red-500"
                    } shrink-0 text-[10px]`}>
                      {kycStatus === "VERIFIED" ? "Verified" : 
                       kycStatus === "UNDER_REVIEW" ? "Pending Review" : 
                       kycStatus === "REJECTED" ? "Rejected" : "Incomplete"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  {userLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      <p className="text-sm text-muted-foreground">Checking verification status...</p>
                    </div>
                  ) : kycStatus === "VERIFIED" ? (
                    <div className="p-6 sm:p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-emerald-200">
                         <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-900">Account Verified</h3>
                      <p className="text-xs sm:text-sm text-emerald-700 mt-2 max-w-sm">
                        Congratulations! Your identity has been verified. You now have full access to all platform features.
                      </p>
                    </div>
                  ) : kycStatus === "UNDER_REVIEW" ? (
                    <div className="p-6 sm:p-8 text-center bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3 sm:mb-4 animate-pulse">
                         <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-amber-900">Verification in Progress</h3>
                      <p className="text-xs sm:text-sm text-amber-700 mt-2 max-w-sm">
                        Your KYC documents are currently being reviewed by our compliance team. This usually takes 24-48 hours.
                      </p>
                    </div>
                  ) : kycStatus === "REJECTED" ? (
                    <div className="p-6 sm:p-8 text-center bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 sm:mb-4">
                         <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-red-900">Verification Rejected</h3>
                      <p className="text-xs sm:text-sm text-red-700 mt-2 max-w-sm">
                        Unfortunately, your documents were rejected. Please review our requirements and try again.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-4 sm:mt-6 text-xs sm:text-sm" 
                        onClick={() => {
                          setKycStep(1);
                          setDocumentPreview(null);
                          setDocumentBackPreview(null);
                          setLivePhoto(null);
                          setDocType("");
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {kycStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-amber-900">Identity Document</p>
                              <p className="text-xs text-amber-800 mt-1">
                                Upload clear photos of both sides of your government-issued ID.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Select Document Type</Label>
                              <Select onValueChange={setDocType} value={docType}>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="National ID">National ID Card</SelectItem>
                                  <SelectItem value="International Passport">International Passport</SelectItem>
                                  <SelectItem value="Drivers License">Driver's License</SelectItem>
                                  <SelectItem value="Voters Card">Voter's Card</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {isCameraOpen && (cameraType === "front" || cameraType === "back") ? (
                              <div className="space-y-4 flex flex-col items-center p-4 bg-black rounded-2xl">
                                <p className="text-white text-xs font-bold uppercase tracking-wider mb-2">Align {cameraType} of card</p>
                                <div className="relative w-full aspect-[1.6/1] max-w-sm rounded-xl overflow-hidden border-2 border-emerald-500/50">
                                  <Webcam 
                                    audio={false} 
                                    ref={webcamRef} 
                                    screenshotFormat="image/jpeg" 
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "environment" }}
                                  />
                                  <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none m-4"></div>
                                </div>
                                <div className="flex gap-4">
                                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => setIsCameraOpen(false)}>Cancel</Button>
                                  <Button onClick={capture} className="rounded-full w-12 h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg" size="icon">
                                    <Camera className="w-6 h-6" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className={`grid grid-cols-1 ${docType === "International Passport" ? "md:grid-cols-1" : "md:grid-cols-2"} gap-4`}>
                                {/* Front Side */}
                                <div className="space-y-2">
                                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                                    {docType === "International Passport" ? "Passport Bio Data Page" : "Front Side"}
                                  </Label>
                                  <div 
                                    className="border-2 border-dashed rounded-xl aspect-[1.6/1] flex flex-col items-center justify-center relative group hover:border-emerald-500/50 transition-all bg-muted/10 overflow-hidden"
                                  >
                                    {documentPreview ? (
                                      <>
                                        <img src={documentPreview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => { setCameraType("front"); setIsCameraOpen(true); }}>
                                            <Camera className="h-4 w-4" />
                                          </Button>
                                          <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => setDocumentPreview(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <div className="flex gap-2">
                                          <Button variant="ghost" size="sm" onClick={() => { setCameraType("front"); setIsCameraOpen(true); }} className="h-8 gap-1 text-[10px]">
                                            <Camera className="h-3 w-3" /> Camera
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => document.getElementById("front-upload")?.click()} className="h-8 gap-1 text-[10px]">
                                            <Upload className="h-3 w-3" /> Upload
                                          </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{docType === "International Passport" ? "Bio-data page" : "Front of card"}</p>
                                      </div>
                                    )}
                                    <input id="front-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleDocumentChange(e, "front")} />
                                  </div>
                                </div>

                                {/* Back Side - Only for non-passports */}
                                {docType !== "International Passport" && (
                                  <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Back Side</Label>
                                    <div 
                                      className="border-2 border-dashed rounded-xl aspect-[1.6/1] flex flex-col items-center justify-center relative group hover:border-emerald-500/50 transition-all bg-muted/10 overflow-hidden"
                                    >
                                      {documentBackPreview ? (
                                        <>
                                          <img src={documentBackPreview} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => { setCameraType("back"); setIsCameraOpen(true); }}>
                                              <Camera className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => setDocumentBackPreview(null)}>
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setCameraType("back"); setIsCameraOpen(true); }} className="h-8 gap-1 text-[10px]">
                                              <Camera className="h-3 w-3" /> Camera
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => document.getElementById("back-upload")?.click()} className="h-8 gap-1 text-[10px]">
                                              <Upload className="h-3 w-3" /> Upload
                                            </Button>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground">Back of card</p>
                                        </div>
                                      )}
                                      <input id="back-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleDocumentChange(e, "back")} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <Button 
                            disabled={!docType || !documentPreview || (docType !== "International Passport" && !documentBackPreview)} 
                            onClick={() => {
                              setKycStep(2);
                              setCameraType("selfie");
                            }} 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                          >
                            Next: Live Photo
                          </Button>
                        </div>
                      )}

                      {kycStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                            <Camera className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Live Selfie</p>
                              <p className="text-xs text-blue-800 mt-1">
                                We need a live photo of you to match with your ID.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center p-2">
                            {livePhoto ? (
                              <div className="relative">
                                <img src={livePhoto} alt="Live" className="w-64 h-64 rounded-full object-cover border-4 border-emerald-500/20 shadow-xl" />
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
                                  onClick={() => setLivePhoto(null)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : isCameraOpen ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-emerald-500/50 bg-black">
                                  <Webcam 
                                    audio={false} 
                                    ref={webcamRef} 
                                    screenshotFormat="image/jpeg" 
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "user" }}
                                  />
                                </div>
                                <Button onClick={capture} className="rounded-full w-12 h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg" size="icon">
                                  <Camera className="w-6 h-6" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" onClick={() => setIsCameraOpen(true)} className="w-full py-12 flex flex-col gap-2 rounded-2xl border-2 border-dashed">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span>Enable Camera for Live Photo</span>
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setKycStep(1)} className="flex-1">Back</Button>
                            <Button disabled={!livePhoto} onClick={() => setKycStep(3)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Next: Review</Button>
                          </div>
                        </div>
                      )}

                      {kycStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                          <h4 className="text-sm font-semibold">Review Submission</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase text-muted-foreground">Document Type</Label>
                              <p className="text-sm font-medium">{docType}</p>
                            </div>
                          </div>
                          <div className={`grid ${docType === "International Passport" ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase text-muted-foreground">{docType === "International Passport" ? "Passport Page" : "Front Side"}</Label>
                              <img src={documentPreview!} className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                            </div>
                            {docType !== "International Passport" && (
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase text-muted-foreground">Back Side</Label>
                                <img src={documentBackPreview!} className="w-full h-24 object-cover rounded-lg border shadow-sm" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground">Live Photo</Label>
                            <img src={livePhoto!} className="w-32 h-32 object-cover rounded-full border shadow-md mx-auto" />
                          </div>

                          <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setKycStep(2)} className="flex-1" disabled={isSubmitting}>Back</Button>
                            <Button 
                              onClick={handleSubmitKyc} 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Verification"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
