import { FileText, FileSpreadsheet, Presentation, Image, Paperclip, type LucideIcon } from 'lucide-react';

export const fileIconMap: Record<string, LucideIcon> = {
    FileText,
    FileSpreadsheet,
    Presentation,
    Image,
    Paperclip,
};

export function getFileIcon(iconName: string): LucideIcon {
    return fileIconMap[iconName] || Paperclip;
}