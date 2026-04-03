$content = Get-Content -Path .\src\components\speakers\SpeakersPanel.tsx -Raw
$content = $content -replace "import { useSpeakers, useUpdateSpeaker } from '@/hooks/useSpeakers';", "import { useSpeakers, useUpdateSpeaker, useLinkSpeaker, useUnlinkSpeaker } from '@/hooks/useSpeakers';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeam } from '@/hooks/useTeams';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';"

$content = $content -replace "export function SpeakersPanel\({ meetingId }: SpeakersPanelProps\) {", @"
export function SpeakersPanel({ meetingId }: SpeakersPanelProps) {
    const { activeTeamSlug } = useWorkspace();
    const { data: teamDetail } = useTeam(activeTeamSlug || '');
    const linkSpeaker = useLinkSpeaker(meetingId);
    const unlinkSpeaker = useUnlinkSpeaker(meetingId);
