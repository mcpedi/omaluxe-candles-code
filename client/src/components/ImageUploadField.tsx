import { useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadField({ value, onChange, label = "Product Image" }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadImage = trpc.products.uploadImage.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await uploadImage.mutateAsync({ imageData: base64, fileName: file.name });
          onChange(result.url);
          toast.success("Image uploaded successfully");
        } catch (error) {
          toast.error("Failed to upload image");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process image");
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-1.5">
        {label}
      </label>

      {/* Image Preview */}
      {value && (
        <div className="mb-3 relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover border border-[oklch(0.88_0.015_75)]"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[oklch(0.88_0.015_75)] px-4 py-6 bg-[oklch(0.97_0.006_80)] hover:bg-[oklch(0.94_0.008_80)] cursor-pointer transition-colors"
        >
          <Upload size={16} className="text-[oklch(0.62_0.12_70)]" />
          <span className="font-sans text-sm text-[oklch(0.52_0.02_60)]">
            {isUploading ? "Uploading..." : "Click to upload or paste image"}
          </span>
        </label>
      </div>

      {/* Manual URL Input */}
      <div className="mt-3">
        <p className="font-sans text-xs text-[oklch(0.52_0.02_60)] mb-1.5">Or paste image URL:</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-white border border-[oklch(0.88_0.015_75)] px-3 py-2.5 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors"
        />
      </div>
    </div>
  );
}
