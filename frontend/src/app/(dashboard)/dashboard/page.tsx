'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Mic, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMeeting } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/constants';
import type { MeetingUploadMetadata } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [context, setContext] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Metadata fields
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('en');
    const [numSpeakers, setNumSpeakers] = useState<number | ''>('');

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
            const metadata: MeetingUploadMetadata = {
                title: title || undefined,
                language: language || undefined,
                num_speakers: numSpeakers ? Number(numSpeakers) : undefined,
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

                {/* Metadata Fields */}
                <div className="mb-6 space-y-2">
                    <Label htmlFor="title">Meeting Title (Optional)</Label>
                    <Input
                        id="title"
                        placeholder="e.g., Remote Control Initial Meeting"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isUploading}
                    />
                </div>

                <div className="mb-6 space-y-2">
                    <Label htmlFor="language">Language (Optional)</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isUploading}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="ur">Urdu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-6 space-y-2">
                    <Label htmlFor="numSpeakers">Number of Speakers (Optional)</Label>
                    <Input
                        id="numSpeakers"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="e.g., 4"
                        value={numSpeakers}
                        onChange={(e) => setNumSpeakers(e.target.value ? parseInt(e.target.value) : '')}
                        disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                        Helps improve speaker diarization accuracy
                    </p>
                </div>

                {/* Context Input */}
                {/* <div className="mb-6 space-y-2">
                    <Label htmlFor="context">Context (Optional)</Label>
                    <Input
                        id="context"
                        placeholder="Add context about this meeting..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        disabled={isUploading}
                    />
                </div> */}


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
