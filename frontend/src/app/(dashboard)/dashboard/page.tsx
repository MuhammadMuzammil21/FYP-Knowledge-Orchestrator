'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Upload,
  Plus,
  X,
  FileAudio,
  FileText,
  Users,
  Tag,
  MessageSquare,
  Network,
  AlertTriangle,
  Loader2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadMeeting } from '@/lib/api/meetings';
import { getErrorMessage } from '@/lib/api/client';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/constants';
import type { MeetingUploadMetadata, Project } from '@/types';
import { getProjects, createProject } from '@/lib/api/projects';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from '@/components/recording/VoiceRecorder';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const RECORDING_CONSENT_TEXT =
  'By starting this recording, you confirm that you have informed all participants and obtained ' +
  'their consent to record and transcribe this conversation for meeting documentation and AI analysis purposes.';

export default function DashboardPage() {
  const router = useRouter();
  const { activeTeamId, can, isTeamWorkspace, workspace, setWorkspace } = useWorkspace();
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Metadata fields
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [minSpeakers, setMinSpeakers] = useState<number | ''>('');
  const [maxSpeakers, setMaxSpeakers] = useState<number | ''>('');
  const [numSpeakers, setNumSpeakers] = useState<number | ''>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // New state for drag-and-drop & recording
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  // Fetch projects on mount or workspace change
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(activeTeamId ? { team_id: activeTeamId } : { personal: 'true' });
        setProjects(data.projects);
        
        // If we have projects, select the first one. 
        // If we switch from personal to team and team has no projects, clear selection.
        if (data.projects.length > 0) {
          setSelectedProjectId(data.projects[0].id);
        } else {
          setSelectedProjectId('');
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, [activeTeamId]);

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
        min_speakers: minSpeakers ? Number(minSpeakers) : undefined,
        max_speakers: maxSpeakers ? Number(maxSpeakers) : undefined,
        num_speakers: numSpeakers ? Number(numSpeakers) : undefined,
        context: context || undefined,
      };

      let projectId = selectedProjectId;

      if (isCreatingProject && newProjectName.trim()) {
        const newProject = await createProject({ 
          name: newProjectName,
          team_id: activeTeamId || undefined 
        });
        projectId = newProject.id;
      }

      if (!projectId) {
        toast.error('Please select or create a project');
        setIsUploading(false);
        return;
      }

      const response = await uploadMeeting(file, projectId, metadata);
      
      if (!response?.meetingId) {
        console.error('Upload succeeded but no meetingId in response:', response);
        toast.error('Processing error: no meeting ID returned');
        return;
      }

      toast.success('Meeting uploaded successfully!');
      setInputMode('upload');
      router.push(`/meetings/${response.meetingId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Reuse existing handleFileChange logic by constructing a synthetic event
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  };
  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">New meeting</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a recording and get AI-powered insights in minutes
            </p>
          </div>
        </div>

        {/* Workspace context banner */}
        {isTeamWorkspace && typeof workspace !== 'string' && (
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm text-indigo-900 dark:text-indigo-200">
                Uploading to team: <span className="font-semibold">{workspace.name}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ─── LEFT COLUMN: Context panel (lg: 2 of 5 cols) ─── */}
        <div className="lg:col-span-2 lg:sticky lg:top-20 space-y-5">
          {/* Processing steps */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              How it works
            </p>
            <div className="space-y-0">
              {[
                {
                  num: '01',
                  title: 'Upload your recording',
                  desc: 'Any format: MP3, WAV, M4A, or OGG up to 100MB.',
                },
                {
                  num: '02',
                  title: 'AI processes everything',
                  desc: 'Transcription, cleanup, speaker detection, and indexing run automatically.',
                },
                {
                  num: '03',
                  title: 'Explore your insights',
                  desc: 'Transcript, entities, chat, graph — all ready in minutes.',
                },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium leading-none mb-1">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What you get */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              What you get
            </p>
            <div className="space-y-2.5">
              {[
                { icon: FileText, label: 'Clean transcript' },
                { icon: Users, label: 'Speaker identification' },
                { icon: Tag, label: 'Tasks & decisions' },
                { icon: MessageSquare, label: 'AI chat interface' },
                { icon: Network, label: 'Knowledge graph' },
                { icon: AlertTriangle, label: 'Conflict detection' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded flex items-center justify-center bg-primary/10 flex-shrink-0">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Upload form (lg: 3 of 5 cols) ─── */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm shadow-black/[0.04]">
            {/* Form card header */}
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold text-sm">Meeting details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Only the recording is required — all other fields are optional
              </p>
            </div>

            {/* Form body */}
            <div className="px-6 py-5 space-y-5">
              {/* Meeting title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium">
                  Meeting title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Q4 product review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  className="h-9"
                />
              </div>

              {/* Project selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Project</Label>
                {projects.length === 0 && !isCreatingProject ? (
                  <div className="rounded-lg border border-dashed border-border p-5 text-center bg-muted/20">
                     <p className="text-sm text-foreground mb-3 font-medium">You don't have any projects yet.</p>
                     <Button 
                       variant="default" 
                       size="sm" 
                       onClick={() => setIsCreatingProject(true)}
                       className="w-full sm:w-auto"
                     >
                       Create a Project First
                     </Button>
                  </div>
                ) : !isCreatingProject ? (
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
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {p.team_id ? 'Team Project' : 'Personal Project'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="font-medium text-primary">
                        <div className="flex items-center gap-2">
                          <Plus className="h-3.5 w-3.5" />
                          Create new project
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      disabled={isUploading}
                      className="h-9 flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
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

              {/* Language selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={isUploading}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Auto-detect dominant language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect dominant language</SelectItem>
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
                  Leave empty to auto-detect the dominant language
                </p>
              </div>

              {/* Speaker configuration */}
              <Accordion type="single" collapsible>
                <AccordionItem value="speakers" className="border border-border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Speaker configuration</span>
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        Optional
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="minSpeakers" className="text-xs font-medium">
                          Min speakers
                        </Label>
                        <Input
                          id="minSpeakers"
                          type="number"
                          min="1"
                          max="20"
                          placeholder="e.g. 2"
                          value={minSpeakers}
                          onChange={(e) =>
                            setMinSpeakers(e.target.value ? parseInt(e.target.value) : '')
                          }
                          disabled={isUploading}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="maxSpeakers" className="text-xs font-medium">
                          Max speakers
                        </Label>
                        <Input
                          id="maxSpeakers"
                          type="number"
                          min="1"
                          max="20"
                          placeholder="e.g. 6"
                          value={maxSpeakers}
                          onChange={(e) =>
                            setMaxSpeakers(e.target.value ? parseInt(e.target.value) : '')
                          }
                          disabled={isUploading}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="numSpeakers" className="text-xs font-medium">
                          Exact count
                        </Label>
                        <Input
                          id="numSpeakers"
                          type="number"
                          min="1"
                          max="20"
                          placeholder="e.g. 4"
                          value={numSpeakers}
                          onChange={(e) =>
                            setNumSpeakers(e.target.value ? parseInt(e.target.value) : '')
                          }
                          disabled={isUploading}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pb-2">
                      Specify speaker range or exact count to improve diarization accuracy
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* ─── RECORDING INPUT — UPLOAD OR RECORD ─── */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Recording</Label>

                {/* Mode toggle */}
                <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-0.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('upload');
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className={cn(
                      'flex-1 rounded-md py-1 text-xs font-medium transition-all duration-150',
                      inputMode === 'upload'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    disabled={isUploading}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!consentGiven) {
                        setShowConsentDialog(true);
                      } else {
                        setInputMode('record');
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                    className={cn(
                      'flex-1 rounded-md py-1 text-xs font-medium transition-all duration-150',
                      inputMode === 'record'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    disabled={isUploading}
                  >
                    Record Live
                  </button>
                </div>

                {/* Upload tab */}
                {inputMode === 'upload' && (
                  <>
                    {/* Hidden native input */}
                    <input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept={ALLOWED_FILE_EXTENSIONS.join(',')}
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />

                    {/* Dropzone area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed',
                        'min-h-[140px] transition-all duration-200',
                        !isUploading && 'cursor-pointer',
                        isDragging
                          ? 'border-primary bg-primary/[0.04] scale-[1.01]'
                          : file
                            ? 'border-border bg-muted/30 border-solid'
                            : 'border-border hover:border-primary/50 hover:bg-primary/[0.02]',
                        isUploading && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {!file ? (
                        <div className="flex flex-col items-center gap-3 text-center px-6 py-6">
                          <div
                            className={cn(
                              'h-11 w-11 rounded-full flex items-center justify-center transition-colors',
                              isDragging ? 'bg-primary/20' : 'bg-primary/10'
                            )}
                          >
                            <Upload
                              className={cn(
                                'h-5 w-5 transition-colors',
                                isDragging ? 'text-primary' : 'text-primary/70'
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {isDragging ? 'Drop to upload' : 'Drop your recording here'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              or click to browse — MP3, WAV, M4A, OGG
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-4 w-full">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileAudio className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={clearFile}
                            disabled={isUploading}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: MP3, WAV, M4A, OGG · Maximum 100MB
                    </p>
                  </>
                )}

                {/* Record tab */}
                {inputMode === 'record' && (
                  <>
                    <VoiceRecorder
                      onRecordingComplete={(wavFile) => setFile(wavFile)}
                      onDiscard={() => setFile(null)}
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Records as WAV · 48kHz stereo · Maximum 100MB (~18 min)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Consent Dialog */}
            <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 text-base">⚠️</span>
                    </div>
                    <DialogTitle className="text-base">Recording Consent Required</DialogTitle>
                  </div>
                  <DialogDescription className="text-sm leading-relaxed text-foreground/80">
                    {RECORDING_CONSENT_TEXT}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConsentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setConsentGiven(true);
                      setShowConsentDialog(false);
                      setInputMode('record');
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    I Confirm &amp; Proceed
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Form card footer with CTA */}
            <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-muted/30 gap-3 sm:gap-0">
              <p className="text-xs text-muted-foreground hidden sm:block">
                Processing usually takes under 5 minutes
              </p>
              {!can('upload_meeting') ? (
                <div title="Viewers cannot upload meetings" className="w-full sm:w-auto sm:ml-auto">
                  <Button disabled className="gap-2 min-w-[148px] w-full sm:w-auto" size="default">
                    <Zap className="h-4 w-4" />
                    Start analysis
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading || (!selectedProjectId && !isCreatingProject) || (isCreatingProject && !newProjectName.trim())}
                  className="gap-2 min-w-[148px] w-full sm:w-auto sm:ml-auto"
                  size="default"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Start analysis
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* end right column */}
      </div>
    </div>
  );
}
