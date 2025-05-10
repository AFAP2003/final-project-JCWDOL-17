import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Star } from 'lucide-react';

export default function ImageUploadPreview({ formik }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.currentTarget.files || []);
    const existingFiles = Array.from(formik.values.image || []);
    const combinedFiles = [...existingFiles, ...selectedFiles];

    formik.setFieldValue('image', combinedFiles);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemove = (index: number) => {
    const updatedFiles = [...formik.values.image];
    const updatedPreviews = [...previews];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    formik.setFieldValue('image', updatedFiles);
    setPreviews(updatedPreviews);

    // Adjust mainIndex if needed
    if (index === mainIndex) {
      setMainIndex(0);
    } else if (index < mainIndex) {
      setMainIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium">Foto</label>
      <Input
        id="image"
        name="image"
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.gif"
        onChange={handleFileChange}
      />

      {formik.touched.image && formik.errors.image && (
        <p className="text-xs text-red-600">{formik.errors.image}</p>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Format yang didukung: JPG, JPEG, PNG, GIF. Ukuran maks.: 1MB.
      </p>

      {/* Image Preview Grid */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {previews.map((src, index) => (
          <div
            key={index}
            className="relative w-[100px] h-[100px] border rounded overflow-hidden"
          >
            <img
              src={src}
              alt={`preview-${index}`}
              className="w-full h-full object-cover"
            />

            {/* Main Badge */}
            {index === mainIndex && (
              <Badge className="absolute top-1 left-1 z-10">Main</Badge>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col justify-center items-center space-y-2 transition">
              {index !== mainIndex && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMainIndex(index)}
                >
                  Set as Main
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
