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
import type { MeetingUploadMetadata, Project } from '@/types';
import { getProjects, createProject } from '@/lib/api/projects';
import { useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [context, setContext] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Metadata fields
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('');
    const [numSpeakers, setNumSpeakers] = useState<number | ''>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data.projects);
                // Default to first project if available
                if (data.projects.length > 0) {
                    setSelectedProjectId(data.projects[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                // Don't block UI, just won't show projects
            }
        };
        fetchProjects();
    }, []);

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
                language: language && language !== 'auto' ? language : undefined,
                num_speakers: numSpeakers ? Number(numSpeakers) : undefined,
                context: context || undefined,
            };

            let projectId = selectedProjectId;

            // Create new project if needed
            if (isCreatingProject && newProjectName.trim()) {
                const newProject = await createProject({ name: newProjectName });
                projectId = newProject.id;
            } else if (!projectId && !isCreatingProject) {
                // Should not happen if validations work, but fallback

                // If no project selected and not creating one, handle error
                if (projects.length === 0) {
                    // Create a default project if none exist
                    const defaultProject = await createProject({ name: 'My First Project' });
                    projectId = defaultProject.id;
                }
            }

            if (!projectId) {
                toast.error('Please select or create a project');
                setIsUploading(false);
                return;
            }

            const response = await uploadMeeting(file, projectId, metadata);

            toast.success('Meeting uploaded successfully!');
            router.push(`/meetings/${response.meeting_id}`);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex h-full items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-full md:max-w-2xl p-4 md:p-8">
                {/* Header */}
                <div className="mb-6 md:mb-8 text-center">
                    <h1 className="mb-2 text-2xl md:text-3xl font-bold">Upload Meeting Recording</h1>
                    <p className="text-muted-foreground">Get AI-powered insights from your meetings</p>
                </div>

                {/* Microphone Icon */}
                <div className="mb-6 md:mb-8 flex justify-center">
                    <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full bg-primary/10">
                        <Mic className="h-12 w-12 md:h-16 md:w-16 text-primary" />
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

                {/* Project Selection */}
                <div className="mb-6 space-y-2">
                    <Label>Project</Label>
                    {!isCreatingProject ? (
                        <div className="flex gap-2">
                            <Select
                                value={selectedProjectId}
                                onValueChange={(val) => {
                                    if (val === 'new') {
                                        setIsCreatingProject(true);
                                    } else {
                                        setSelectedProjectId(val);
                                    }
                                }}
                                disabled={isUploading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                    <SelectItem value="new" className="font-semibold text-primary">
                                        <div className="flex items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New Project
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Enter project name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                disabled={isUploading}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsCreatingProject(false);
                                    setNewProjectName('');
                                }}
                                disabled={isUploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mb-6 space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isUploading}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Dominant Language (Auto-detect)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Dominant Language (Auto-detect)</SelectItem>
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
                    <p className="text-xs text-muted-foreground">
                        Leave empty to auto-detect the dominant language.
                    </p>
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
