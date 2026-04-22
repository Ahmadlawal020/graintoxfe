import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { uploadFile } from "@/services/api/uploadApi"; // You'll need to implement this

interface FileUploadProps {
  type: "image" | "pdf";
  onUpload: (url: string) => void;
}

const FileUpload = ({ type, onUpload }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (
      (type === "image" && !file.type.startsWith("image/")) ||
      (type === "pdf" && file.type !== "application/pdf")
    ) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a ${
          type === "image" ? "image" : "PDF"
        } file.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload file to your server
      const response = await uploadFile(formData);
      onUpload(response.url);

      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description:
          "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        {type === "image" ? (
          <Image className="w-8 h-8 text-primary" />
        ) : (
          <File className="w-8 h-8 text-primary" />
        )}
        <p className="text-sm font-medium">
          Upload {type === "image" ? "Image" : "PDF"}
        </p>
        <Input
          type="file"
          accept={type === "image" ? "image/*" : "application/pdf"}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${type}`}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          className="w-full"
        >
          <label
            htmlFor={`file-upload-${type}`}
            className="flex items-center justify-center w-full h-full cursor-pointer"
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </>
            )}
          </label>
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
