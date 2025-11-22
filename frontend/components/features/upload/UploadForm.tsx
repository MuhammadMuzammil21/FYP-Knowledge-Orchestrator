'use client';

import { useState, useCallback } from 'react';
import { Upload, X, FileAudio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useUploadMeeting, useMockComplete } from '../../../src/lib/hooks/useMeetings';
import { validateFile } from '../../../src/lib/utils/validation';
import { formatFileSize } from '../../../src/lib/utils/formatters';
import { cn } from '../../../src/lib/utils/cn';

interface UploadFormProps {
  onUploadSuccess?: (meetingId: string) => void;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const uploadMutation = useUploadMeeting();
  const mockCompleteMutation = useMockComplete();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    
    if (!validation.valid) {
      toast.error('Invalid File', {
        description: validation.error,
      });
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const response = await uploadMutation.mutateAsync({
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });

      toast.success('Upload Successful', {
        description: 'Processing your meeting...',
      });

      // Simulate processing completion (remove in production)
      setTimeout(async () => {
        await mockCompleteMutation.mutateAsync(response.meeting_id);
        
        toast.success('Processing Complete', {
          description: 'Your meeting is ready to view!',
        });

        if (onUploadSuccess) {
          onUploadSuccess(response.meeting_id);
        }

        // Reset form
        setFile(null);
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      toast.error('Upload Failed', {
        description: 'Please try again.',
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const isUploading = uploadMutation.isPending || mockCompleteMutation.isPending;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Dropzone */}
        {!file && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            
            <h3 className="text-lg font-semibold mb-2">
              Upload Meeting Recording
            </h3>
            
            <p className="text-sm text-muted-foreground mb-6">
              Drag & drop your audio file here, or click to browse
            </p>

            <input
              type="file"
              id="file-input"
              accept=".mp3,.wav,.m4a,.ogg"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />

            <Button asChild>
              <label htmlFor="file-input" className="cursor-pointer">
                Browse Files
              </label>
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: MP3, WAV, M4A, OGG • Max size: 100MB
            </p>
          </div>
        )}

        {/* Selected File */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <FileAudio className="h-10 w-10 text-primary flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </span>
                  <span className="font-medium">
                    {uploadProgress < 100 ? `${uploadProgress}%` : 'Please wait'}
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Upload Button */}
            {!isUploading && (
              <Button
                onClick={handleUpload}
                className="w-full"
                size="lg"
              >
                Upload & Process
              </Button>
            )}

            {isUploading && (
              <Button disabled className="w-full" size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}