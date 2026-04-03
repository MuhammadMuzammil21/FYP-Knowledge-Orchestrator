'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mic, Square, Trash2, Loader2, Play } from 'lucide-react';
import { useVoiceIdentity, useRegisterVoiceIdentity, useDeleteVoiceIdentity } from '@/hooks/useVoiceIdentity';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { toast } from 'sonner';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceIdentityTab() {
    const { data, isLoading } = useVoiceIdentity();
    const registerMutation = useRegisterVoiceIdentity();
    const deleteMutation = useDeleteVoiceIdentity();
    
    // Recorder state
    const recorder = useVoiceRecorder();
    
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleRecordToggle = async () => {
        if (recorder.state === 'idle' || recorder.state === 'done' || recorder.state === 'error') {
            await recorder.requestPermission();
        } else if (recorder.state === 'ready') {
            recorder.startRecording();
        } else if (recorder.state === 'recording') {
            recorder.stopRecording();
        }
    };

    const handleUpload = async () => {
        if (!recorder.audioFile) return;
        
        registerMutation.mutate(recorder.audioFile, {
            onSuccess: () => {
                recorder.discardRecording();
                setAudioUrl(null);
            }
        });
    };

    const handleDelete = async () => {
        deleteMutation.mutate();
    };

    const isUploading = registerMutation.isPending;
    const isDeleting = deleteMutation.isPending;
    const hasVoice = data?.status === 'ready' || data?.status === 'pending';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Voice Identity</CardTitle>
                <CardDescription>
                    Register your voice to help HarBaat AI automatically identify you in meetings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <h4 className="font-medium mb-1">Status</h4>
                            {data?.status === 'ready' && (
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium tracking-wide flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                                    Voice Registered
                                </p>
                            )}
                            {data?.status === 'pending' && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium tracking-wide flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                    Processing Voice Profile...
                                </p>
                            )}
                            {data?.status === 'error' && (
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium tracking-wide flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                                    Processing Failed. Please try again.
                                </p>
                            )}
                            {(!data || data.status === 'not_registered') && (
                                <p className="text-sm text-muted-foreground font-medium tracking-wide flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 mr-2" />
                                    Not Registered
                                </p>
                            )}
                        </div>

                        {!hasVoice ? (
                            <div className="space-y-4">
                                <p className="text-sm">
                                    Record a short 5-10 second clip of you speaking naturally.
                                    This audio is securely encrypted and used exclusively for speaker identification within your team.
                                </p>

                                {recorder.state === 'error' && (
                                    <div className="text-sm text-destructive rounded-md bg-destructive/10 p-3">
                                        {recorder.error}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center gap-4 border rounded-lg p-6 bg-card">
                                    <Button 
                                        size="lg" 
                                        variant={recorder.state === 'recording' ? 'destructive' : 'default'}
                                        className="w-full sm:w-auto min-w-[140px] rounded-full aspect-square sm:aspect-auto h-24 sm:h-12"
                                        onClick={handleRecordToggle}
                                        disabled={recorder.state === 'converting' || isUploading}
                                    >
                                        {recorder.state === 'recording' ? (
                                            <>
                                                <Square className="h-5 w-5 sm:mr-2 fill-current" />
                                                <span className="hidden sm:inline">Stop</span>
                                            </>
                                        ) : recorder.state === 'ready' ? (
                                            <>
                                                <Mic className="h-5 w-5 sm:mr-2" />
                                                <span className="hidden sm:inline">Start Recording</span>
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="h-5 w-5 sm:mr-2" />
                                                <span className="hidden sm:inline">Allow Mic</span>
                                            </>
                                        )}
                                    </Button>

                                    {(recorder.state === 'recording' || recorder.state === 'converting' || recorder.state === 'ready') && (
                                        <div className="flex-1 text-center sm:text-left">
                                            {recorder.state === 'converting' ? (
                                                <span className="text-sm font-medium animate-pulse">Converting...</span>
                                            ) : recorder.state === 'ready' ? (
                                                <span className="text-sm text-muted-foreground">Ready to record</span>
                                            ) : (
                                                <span className="text-xl font-mono tabular-nums text-destructive flex items-center justify-center sm:justify-start gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                                    {formatTime(recorder.durationSeconds)}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {recorder.state === 'done' && recorder.audioFile && (
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                            <audio 
                                                controls 
                                                src={URL.createObjectURL(recorder.audioFile)} 
                                                className="w-full h-10"
                                            />
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={handleUpload} 
                                                    disabled={isUploading}
                                                    size="sm"
                                                >
                                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                    Upload
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => recorder.discardRecording()}
                                                    disabled={isUploading}
                                                    size="sm"
                                                >
                                                    Discard
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                    <Mic className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium">Voice Identity Active</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                                    Your voice profile helps us automatically identify you in recordings as a speaker.
                                </p>
                                
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Remove Voice Identity
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
