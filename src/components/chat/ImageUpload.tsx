import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, X, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesSelected: (images: File[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

const SUPPORTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 5;

export function ImageUpload({
  onImagesSelected,
  maxImages = MAX_IMAGES,
  maxSizePerImage = MAX_FILE_SIZE,
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!Object.keys(SUPPORTED_IMAGE_TYPES).includes(file.type)) {
      return `Unsupported file type. Please use JPEG, PNG, WebP, or GIF.`;
    }

    // Check file size
    if (file.size > maxSizePerImage) {
      const maxSizeMB = maxSizePerImage / (1024 * 1024);
      return `File size exceeds ${maxSizeMB}MB limit.`;
    }

    return null;
  }, [maxSizePerImage]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed`);
    }

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (selectedImages.length + validFiles.length < maxImages) {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Error",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles];
      const newPreviews = [...previews];

      validFiles.forEach((file) => {
        newPreviews.push(URL.createObjectURL(file));
      });

      setSelectedImages(newImages);
      setPreviews(newPreviews);
      onImagesSelected(newImages);
    }
  }, [selectedImages, previews, maxImages, validateFile, onImagesSelected, toast]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFilesSelected(acceptedFiles);
    },
    [handleFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_IMAGE_TYPES,
    disabled,
    multiple: true,
  });

  const removeImage = useCallback(
    (index: number) => {
      const newImages = selectedImages.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);
      
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(previews[index]);
      
      setSelectedImages(newImages);
      setPreviews(newPreviews);
      onImagesSelected(newImages);
    },
    [selectedImages, previews, onImagesSelected]
  );

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed p-6 cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
          ${selectedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            {isDragActive
              ? 'Drop images here...'
              : selectedImages.length >= maxImages
              ? `Maximum ${maxImages} images reached`
              : 'Drag & drop images here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, GIF • Max {formatFileSize(maxSizePerImage)} per image
          </p>
        </div>
      </Card>

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected Images ({selectedImages.length}/{maxImages})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                previews.forEach((url) => URL.revokeObjectURL(url));
                setSelectedImages([]);
                setPreviews([]);
                onImagesSelected([]);
              }}
              disabled={disabled}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedImages.map((file, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={previews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* File info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-gray-300">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Upload stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </span>
            <span>
              Total: {formatFileSize(selectedImages.reduce((sum, file) => sum + file.size, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div>
          <p>• Maximum {maxImages} images per message</p>
          <p>• Supported formats: JPEG, PNG, WebP, GIF</p>
          <p>• Maximum {formatFileSize(maxSizePerImage)} per image</p>
          <p>• Images will be processed and analyzed by AI</p>
        </div>
      </div>
    </div>
  );
} 