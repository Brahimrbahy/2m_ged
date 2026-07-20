import { Head } from '@inertiajs/react';
import VersionDetailComponent from '@/components/version-detail';
import type { DocumentVersion } from '@/types';

type Props = {
    document: {
        id: number;
        title: string;
        version: number;
        file_type: string;
        icon: string;
    };
    version: DocumentVersion;
};

export default function VersionDetailPage({ document, version }: Props) {
    return (
        <>
            <Head title={`v${version.version_number} - ${document.title}`} />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <VersionDetailComponent
                    documentId={document.id}
                    documentTitle={document.title}
                    documentVersion={document.version}
                    version={version}
                    canEdit={true}
                />
            </div>
        </>
    );
}

VersionDetailPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Documents', href: '/documents' },
        { title: 'Version Detail', href: '' },
    ],
};
