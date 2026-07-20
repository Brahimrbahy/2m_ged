import { router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { SearchResult } from '@/types';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/search/instant?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data);
            setIsOpen(true);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchResults(value);
        }, 300);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.get('/search', { q: query.trim() });
        }
    }

    function handleResultClick(id: number) {
        setIsOpen(false);
        setQuery('');
        router.get(`/documents/${id}`);
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search documents..."
                    value={query}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    className="pl-9 pr-16"
                />
                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    Enter
                </button>
            </form>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-slate-900">
                    {results.map((result) => (
                        <button
                            key={result.id}
                            onClick={() => handleResultClick(result.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <span className="text-lg">{result.icon}</span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{result.title}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {result.formatted_size} — {result.uploader.name}
                                    {result.space && <span> in {result.space.name}</span>}
                                </p>
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            router.get('/search', { q: query.trim() });
                        }}
                        className="w-full border-t px-4 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-800"
                    >
                        View all results
                    </button>
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white p-4 text-center text-sm text-muted-foreground shadow-lg dark:bg-slate-900">
                    No documents found for "{query}"
                </div>
            )}
        </div>
    );
}
