'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mic, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMeeting } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/constants';

export default function DashboardPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [context, setContext] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_FILE_EXTENSIONS.includes(fileExt as any)) {
            toast.error(`Invalid file type. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`);
            return;
        }

        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds 100MB limit');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setIsUploading(true);

        try {
            const metadata = {
                context: context || undefined,
            };

            const response = await uploadMeeting(file, 'default-project', metadata);

            toast.success('Meeting uploaded successfully!');
            router.push(`/meetings/${response.meeting_id}`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex h-full items-center justify-center p-8">
            <Card className="w-full max-w-2xl p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold">Upload Meeting Recording</h1>
                    <p className="text-muted-foreground">Get AI-powered insights from your meetings</p>
                </div>

                {/* Microphone Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                        <Mic className="h-16 w-16 text-primary" />
                    </div>
                </div>


                {/* Context Input */}
                <div className="mb-6 space-y-2">
                    <Label htmlFor="context">Context (Optional)</Label>
                    <Input
                        id="context"
                        placeholder="Add context about this meeting..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        disabled={isUploading}
                    />
                </div>


                {/* How It Works Disclaimer */}
                <div className="mb-6 rounded-lg border border-border bg-muted p-4">
                    <h3 className="mb-2 font-semibold text-foreground">How It Works</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Upload your meeting audio file (MP3, WAV, M4A, or OGG)</li>
                        <li>• Our AI transcribes and analyzes the conversation</li>
                        <li>• Extract key insights: speakers, topics, tasks, and decisions</li>
                        <li>• Detect conflicts with previous meetings automatically</li>
                        <li>• Ask questions about your meeting using RAG search</li>
                    </ul>
                </div>

                {/* File Upload */}
                <div className="mb-6 space-y-2">
                    <Label htmlFor="file">Upload Recording</Label>
                    <div className="flex gap-2">
                        <Input
                            id="file"
                            type="file"
                            accept={ALLOWED_FILE_EXTENSIONS.join(',')}
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="flex-1"
                        />
                    </div>
                    {file && (
                        <p className="text-sm text-muted-foreground">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Supported formats: MP3, WAV, M4A, OGG (Max 100MB)
                    </p>
                </div>

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full"
                    size="lg"
                >
                    <Upload className="mr-2 h-5 w-5" />
                    {isUploading ? 'Uploading...' : 'Start Analysis'}
                </Button>
            </Card>
        </div>
    );
}
