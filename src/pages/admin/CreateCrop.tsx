import React, { useState } from "react";
import { ArrowLeft, Save, Wheat, Tag, Coins, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCreateCropMutation } from "@/services/api/cropApiSlice";

const CreateCrop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [createCrop, { isLoading }] = useCreateCropMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Cereal",
    pricePerUnit: "",
    tokenSymbol: "",
    quality: "Grade A",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCrop({
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit)
      }).unwrap();
      
      toast({ title: "Success", description: "Commodity registered successfully. Please define stock separately in respective warehouses." });
      navigate("/crops");
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to register commodity", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10 max-w-4xl">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/crops")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Market Index
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Register Market Commodity</h1>
        <p className="text-muted-foreground">List a new agricultural asset class for trade scaling and warehouse registry.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          
          <div className="space-y-4 border rounded-lg p-5">
            <div className="flex items-center space-x-2 border-b pb-3">
              <Wheat className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-medium">Commodity Profile</h2>
            </div>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="name">System Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Maize (Yellow)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label htmlFor="code">Asset Code *</Label>
                   <Input id="code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. GT-MAIZE" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cereal">Cereal</SelectItem>
                      <SelectItem value="Legume">Legume</SelectItem>
                      <SelectItem value="Tuber">Tuber</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="quality">Grading Tier</Label>
                <Select value={formData.quality} onValueChange={(v) => handleSelectChange("quality", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Grade C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-5">
            <div className="flex items-center space-x-2 border-b pb-3">
              <Coins className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-medium">Financial & Blockchain Metadata</h2>
            </div>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="pricePerUnit">Initial Price / MT (₦) *</Label>
                <Input id="pricePerUnit" name="pricePerUnit" type="number" min="0" value={formData.pricePerUnit} onChange={handleChange} required placeholder="e.g. 250000" />
              </div>
              <div>
                <Label htmlFor="tokenSymbol">Token Index Symbol *</Label>
                <Input id="tokenSymbol" name="tokenSymbol" value={formData.tokenSymbol} onChange={handleChange} required placeholder="e.g. GT-MZ" className="uppercase" />
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-start gap-4 mt-6">
          <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-8">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Deploy Commodity"}
          </Button>
          <Button variant="outline" type="button" onClick={() => navigate("/crops")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCrop;
