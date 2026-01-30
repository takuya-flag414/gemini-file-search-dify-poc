import { Settings } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { Input } from '../../atoms';

interface SettingsSectionProps {
    isOpen: boolean;
    onToggle: () => void;
    apiKey: string;
    workflowApiKey: string;
    baseUrl: string;
    onApiKeyChange: (value: string) => void;
    onWorkflowApiKeyChange: (value: string) => void;
    onBaseUrlChange: (value: string) => void;
}

export function SettingsSection({
    isOpen,
    onToggle,
    apiKey,
    workflowApiKey,
    baseUrl,
    onApiKeyChange,
    onWorkflowApiKeyChange,
    onBaseUrlChange,
}: SettingsSectionProps) {
    return (
        <SidebarSection
            title="設定"
            icon={<Settings className="w-4 h-4 text-sys-text-secondary" />}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-3">
                <Input
                    label="API Key (Backend A: Chat)"
                    type="password"
                    placeholder="app-xxxxxxxx"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    hint={apiKey.startsWith('app-') ? '✓ 有効な形式' : 'app-で始まるAPIキーを入力'}
                />
                <Input
                    label="Workflow API Key (Backend B)"
                    type="password"
                    placeholder="app-xxxxxxxx"
                    value={workflowApiKey}
                    onChange={(e) => onWorkflowApiKeyChange(e.target.value)}
                    hint={workflowApiKey.startsWith('app-') ? '✓ 有効な形式' : 'Backend B用のAPIキー'}
                />
                <Input
                    label="Base URL"
                    type="url"
                    placeholder="https://api.dify.ai/v1"
                    value={baseUrl}
                    onChange={(e) => onBaseUrlChange(e.target.value)}
                />
            </div>
        </SidebarSection>
    );
}
