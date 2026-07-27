import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'lucide-react';

type RichEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
};

const TOOLBAR_BUTTONS = [
    { label: 'B', command: 'bold', title: 'Bold' },
    { label: 'I', command: 'italic', title: 'Italic' },
    { label: 'U', command: 'underline', title: 'Underline' },
    { label: 'H1', command: 'formatBlock', value: 'h2', title: 'Heading' },
    { label: '•', command: 'insertUnorderedList', title: 'Bullet List' },
    { label: '1.', command: 'insertOrderedList', title: 'Numbered List' },
    { label: '', command: 'createLink', title: 'Insert Link' },
] as const;

export default function RichEditor({
    value,
    onChange,
    placeholder = 'Write something...',
    minHeight = '200px',
}: RichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const isInternalChange = useRef(false);

    useEffect(() => {
        const el = editorRef.current;
        if (!el || isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (el.innerHTML !== value) {
            el.innerHTML = value;
        }
    }, [value]);

    const execCommand = useCallback(
        (command: string, value?: string) => {
            if (command === 'createLink') {
                const url = window.prompt('Enter URL:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else if (command === 'formatBlock') {
                document.execCommand('formatBlock', false, `<${value}>`);
            } else {
                document.execCommand(command, false);
            }

            if (editorRef.current) {
                isInternalChange.current = true;
                onChange(editorRef.current.innerHTML);
            }
        },
        [onChange],
    );

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    return (
        <div
            className={`rounded-lg border transition-colors ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-input'}`}
        >
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50 px-2 py-1 dark:bg-slate-800">
                {TOOLBAR_BUTTONS.map((btn) => (
                    <button
                        key={btn.command}
                        type="button"
                        title={btn.title}
                        onClick={() => execCommand(btn.command, btn.value)}
                        className="flex h-7 w-7 items-center justify-center rounded text-xs font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        {btn.command === 'createLink' ? <Link className="h-4 w-4" /> : btn.label}
                    </button>
                ))}
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="prose prose-sm dark:prose-invert min-h-[200px] px-4 py-3 text-sm empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:outline-none"
                style={{ minHeight }}
                data-placeholder={placeholder}
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </div>
    );
}
