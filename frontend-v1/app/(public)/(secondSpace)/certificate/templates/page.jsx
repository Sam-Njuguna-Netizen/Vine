'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import axios from "@/app/api/axios";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            // Assuming axios instance with auth interceptor exists or we use standard fetch with token
            // For now, using direct axios, assuming global config handles auth or this is a placeholder
            const res = await axios.get('/api/certificate-templates');
            if (res.data.success) {
                setTemplates(res.data.templates);
            }
        } catch (error) {
            console.error("Failed to fetch templates", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/certificate-templates/${id}`);
            fetchTemplates();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Certificate Templates</h1>
                    <p className="text-gray-500">Manage your custom certificate designs</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/certificate">
                        <Button variant="outline">
                            Back to Issuance
                        </Button>
                    </Link>
                    <Link href="/certificate/templates/builder">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Create New Template
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Search templates..."
                    className="pl-10"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(t => (
                    <Card key={t.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-500">
                        <div className="aspect-[1.4] bg-slate-100 flex items-center justify-center p-4">
                            {t.thumbnail ? (
                                <img src={t.thumbnail} alt={t.name} className="w-full h-full object-contain shadow-sm" />
                            ) : (
                                <span className="text-slate-400 text-sm">No Preview</span>
                            )}
                        </div>
                        <div className="p-4 border-t bg-white">
                            <h3 className="font-bold text-slate-800 truncate">{t.name}</h3>
                            <p className="text-xs text-slate-500">Created {new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Link href={`/certificate/templates/builder?id=${t.id}`}>
                                <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white text-slate-700 shadow-sm">
                                    <Edit size={14} />
                                </Button>
                            </Link>
                            <Button onClick={() => handleDelete(t.id)} size="icon" variant="destructive" className="h-8 w-8 shadow-sm">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
