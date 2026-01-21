import { Settings } from 'lucide-react';
import { SidebarSection } from './SidebarSection';
import { Input } from '../../atoms';

interface SettingsSectionProps {
    isOpen: boolean;
    onToggle: () => void;
    apiKey: string;
    baseUrl: string;
    onApiKeyChange: (value: string) => void;
    onBaseUrlChange: (value: string) => void;
}

export function SettingsSection({
    isOpen,
    onToggle,
    apiKey,
    baseUrl,
    onApiKeyChange,
    onBaseUrlChange,
}: SettingsSectionProps) {
    return (
        <SidebarSection
            title="設定"
            icon={<Settings className="w-4 h-4" />}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-3">
                <Input
                    label="API Key"
                    type="password"
                    placeholder="app-xxxxxxxx"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    hint={apiKey.startsWith('app-') ? '✓ 有効な形式' : 'app-で始まるAPIキーを入力'}
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
