'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mic, Upload, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMeeting } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/constants';

export default function DashboardPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [encounterType, setEncounterType] = useState<'in-person' | 'virtual'>('in-person');
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
                encounter_type: encounterType,
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
                    <h1 className="mb-2 text-3xl font-bold">Start New Encounter</h1>
                    <p className="text-gray-600">Upload a meeting recording to begin analysis</p>
                </div>

                {/* Microphone Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100">
                        <Mic className="h-16 w-16 text-blue-600" />
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

                {/* Encounter Type Selector */}
                <div className="mb-6 space-y-2">
                    <Label>Encounter Type</Label>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant={encounterType === 'in-person' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => setEncounterType('in-person')}
                            disabled={isUploading}
                        >
                            <Radio className="mr-2 h-4 w-4" />
                            In-person
                        </Button>
                        <Button
                            type="button"
                            variant={encounterType === 'virtual' ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => setEncounterType('virtual')}
                            disabled={isUploading}
                        >
                            <Mic className="mr-2 h-4 w-4" />
                            Virtual
                        </Button>
                    </div>
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
                        <p className="text-sm text-gray-600">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                    <p className="text-xs text-gray-500">
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
                    {isUploading ? 'Uploading...' : 'Start Encounter'}
                </Button>
            </Card>
        </div>
    );
}
