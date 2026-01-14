'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Move, Upload, Image as ImgI, Type, Trash2, Save, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from "@/app/api/axios";

import html2canvas from 'html2canvas'; // Keeping for thumbnail generation
import Link from 'next/link';

// Simple Toast fallback
const toast = (msg) => alert(msg);

const REQUIRED_FIELDS = [
    { label: 'Course Name', placeholder: '{course_name}', defaultVal: 'Course Name', fontSize: 24, fontWeight: 'bold' },
    { label: 'Participant Name', placeholder: '{student_name}', defaultVal: 'Participant Name', fontSize: 32, fontWeight: 'bold' },
    { label: 'Issue Date', placeholder: '{date}', defaultVal: 'Date', fontSize: 16 },
    { label: 'Instructor Name', placeholder: '{instructor}', defaultVal: 'Instructor Name', fontSize: 18 },
    { label: 'Duration', placeholder: '{duration}', defaultVal: 'Duration', fontSize: 16 },
];

function BuilderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('id');

    const certRef = useRef(null);
    const containerRef = useRef(null);

    // State
    const [templateName, setTemplateName] = useState('My New Template');
    const [elements, setElements] = useState([
        // Init with basic required fields layout if new
        { id: '1', type: 'text', value: 'CERTIFICATE OF COMPLETION', x: 561, y: 100, fontSize: 40, fontFamily: 'serif', fontWeight: 'bold', color: '#000000', width: 800, textAlign: 'center' },
        { id: 'req_course', type: 'text', value: '{course_name}', x: 561, y: 300, fontSize: 24, fontFamily: 'sans-serif', fontWeight: 'bold', color: '#000000', width: 600, textAlign: 'center', isRequired: true, label: 'Course Name' },
        { id: 'req_student', type: 'text', value: '{student_name}', x: 561, y: 400, fontSize: 36, fontFamily: 'serif', fontWeight: 'bold', color: '#000000', width: 600, textAlign: 'center', isRequired: true, label: 'Participant Name' },
        { id: 'req_date', type: 'text', value: '{date}', x: 800, y: 600, fontSize: 16, fontFamily: 'sans-serif', color: '#000000', width: 200, textAlign: 'center', isRequired: true, label: 'Issue Date' },
        { id: 'req_instructor', type: 'text', value: '{instructor}', x: 300, y: 600, fontSize: 18, fontFamily: 'sans-serif', color: '#000000', width: 200, textAlign: 'center', isRequired: true, label: 'Instructor Name' },
    ]);
    const [selectedId, setSelectedId] = useState(null);
    const [zoom, setZoom] = useState(0.6);
    const [saving, setSaving] = useState(false);

    // Load existing if ID present
    useEffect(() => {
        if (templateId) {
            axios.get(`/api/certificate-templates/${templateId}`)
                .then(res => {
                    if (res.data.success) {
                        const t = res.data.template;
                        setTemplateName(t.name);
                        try {
                            const parsed = JSON.parse(t.data);
                            // Ensure backward compatibility or fix missing new fields if needed
                            setElements(parsed);
                        } catch (e) { console.error("Parse error", e); }
                    }
                })
                .catch(err => console.error(err));
        }
    }, [templateId]);

    // --- ACTIONS ---
    const addText = () => {
        const newEl = {
            id: Date.now().toString(),
            type: 'text',
            value: 'New Text',
            x: 561, y: 400,
            fontSize: 24,
            fontFamily: 'sans-serif',
            color: '#000000',
            width: 300,
            textAlign: 'center'
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const addRequiredField = (field) => {
        if (elements.some(el => el.value === field.placeholder)) {
            toast(`${field.label} already added! switch to edit mode to move it.`);
            return;
        }
        const newEl = {
            id: `req_${Date.now()}`,
            type: 'text',
            value: field.placeholder,
            x: 561, y: 450,
            fontSize: field.fontSize,
            fontFamily: 'sans-serif',
            fontWeight: field.fontWeight || 'normal',
            color: '#000000',
            width: 300,
            textAlign: 'center',
            isRequired: true,
            label: field.label
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const addPlaceholderImage = (type) => {
        // type: 'logo' or 'signature'
        if (elements.some(el => el.placeholderType === type)) {
            toast(`${type} placeholder already added!`);
            return;
        }
        const newEl = {
            id: `req_${type}_${Date.now()}`,
            type: 'image',
            value: type === 'logo' ? '/placeholder-logo.png' : '/placeholder-signature.png', // You might need real placeholders in public folder or base64
            x: type === 'logo' ? 1000 : 200,
            y: type === 'logo' ? 100 : 650,
            width: type === 'logo' ? 100 : 150,
            height: type === 'logo' ? 100 : 60,
            placeholderType: type, // 'logo' or 'signature'
            isRequired: true,
            label: type === 'logo' ? 'Logo Placeholder' : 'Signature Placeholder'
        };

        // Use a simple colored box as placeholder if image not found (simulated by data URL for now)
        // Creating a simple SVG data URI for placeholder visual
        const svg = `
        <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg" style="background:#ddd">
            <rect width="100%" height="100%" fill="#eee"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#999">${type.toUpperCase()}</text>
            <rect width="100%" height="100%" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,5"/>
        </svg>`;
        newEl.value = 'data:image/svg+xml;base64,' + btoa(svg);


        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    }

    const addImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const newEl = {
                id: Date.now().toString(),
                type: 'image',
                value: reader.result,
                x: 561, y: 400,
                width: 200,
                height: 200,
                maintainRatio: true
            };
            setElements([...elements, newEl]);
            setSelectedId(newEl.id);
        };
        reader.readAsDataURL(file);
    };

    const updateElement = (id, props) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
    };

    const deleteSelected = () => {
        if (selectedId) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
        }
    };

    const handleSave = async () => {
        if (!templateName) return toast("Please enter a name");
        setSaving(true);
        try {
            // Generate Thumbnail
            setSelectedId(null);
            await new Promise(r => setTimeout(r, 100));

            let thumbnail = '';
            if (certRef.current) {
                // Increased scale for better quality thumbnails
                const canvas = await html2canvas(certRef.current, { scale: 1, useCORS: true });
                thumbnail = canvas.toDataURL('image/jpeg', 0.9);
            }

            const payload = {
                name: templateName,
                data: JSON.stringify(elements),
                thumbnail,
                isPublic: true
            };

            if (templateId) {
                await axios.put(`/api/certificate-templates/${templateId}`, payload);
            } else {
                await axios.post('/api/certificate-templates', payload);
            }

            toast("Template saved successfully!");
            router.push('/certificate/templates');
        } catch (error) {
            console.error(error);
            toast("Failed to save template.");
        } finally {
            setSaving(false);
        }
    };

    // --- DRAG ---
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e, el) => {
        e.stopPropagation();
        setSelectedId(el.id);
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (isDragging && selectedId && certRef.current) {
            const rect = certRef.current.getBoundingClientRect();
            // Scale logic
            const scaleX = 1123 / rect.width;
            const scaleY = 794 / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            updateElement(selectedId, { x, y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* SIDEBAR */}
            <div className="w-80 bg-white border-r border-slate-200 z-10 flex flex-col shadow-lg">
                <div className="p-4 border-b flex items-center gap-3 bg-slate-50">
                    <Link href="/certificate/templates">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft size={16} /></Button>
                    </Link>
                    <Input
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                        className="h-9 font-bold bg-white"
                        placeholder="Template Name"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-gray-300">

                    {/* REQUIRED FIELDS SECTION */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Required Fields</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {REQUIRED_FIELDS.map(field => {
                                const exists = elements.some(el => el.value === field.placeholder);
                                return (
                                    <Button
                                        key={field.label}
                                        variant={exists ? "ghost" : "outline"}
                                        size="sm"
                                        onClick={() => addRequiredField(field)}
                                        className={exists ? "justify-start text-green-600 bg-green-50" : "justify-start"}
                                        disabled={exists}
                                    >
                                        <Plus size={14} className="mr-2" /> {field.label} {exists && "(Added)"}
                                    </Button>
                                )
                            })}

                            {/* ASSETS */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => addPlaceholderImage('logo')}
                                    disabled={elements.some(el => el.placeholderType === 'logo')}
                                >
                                    + Add Logo
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => addPlaceholderImage('signature')}
                                    disabled={elements.some(el => el.placeholderType === 'signature')}
                                >
                                    + Add Sig
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    {/* CUSTOM ELEMENTS */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Custom Elements</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="secondary" onClick={addText} className="justify-start gap-2 h-9">
                                <Type size={16} /> Text
                            </Button>
                            <label className="cursor-pointer">
                                <div className="flex items-center justify-start gap-2 h-9 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md text-sm font-medium transition-colors">
                                    <ImgI size={16} /> Image
                                </div>
                                <input type="file" className="hidden" onChange={addImage} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* SELECTED EDIT */}
                    {selectedId ? (
                        <div className="space-y-4 border rounded-xl p-4 bg-slate-50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <h3 className="font-bold text-xs uppercase text-blue-600">Editing Selected</h3>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={deleteSelected}><Trash2 size={14} /></Button>
                            </div>

                            {(() => {
                                const el = elements.find(e => e.id === selectedId);
                                if (!el) return null;
                                return (
                                    <>
                                        {el.type === 'text' && (
                                            <>
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-semibold text-slate-600">Content</Label>
                                                    <textarea
                                                        className="w-full text-sm border rounded-md p-2 min-h-[60px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        value={el.value}
                                                        onChange={e => updateElement(el.id, { value: e.target.value })}
                                                        disabled={el.isRequired} // Lock required fields
                                                    />
                                                    {el.isRequired && <p className="text-[10px] text-amber-600 font-medium">This is a required field placeholder.</p>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs font-semibold text-slate-600">Size (px)</Label>
                                                        <Input type="number" value={el.fontSize} onChange={e => updateElement(el.id, { fontSize: parseInt(e.target.value) })} className="h-8 bg-white" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-semibold text-slate-600">Color</Label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="color" value={el.color} onChange={e => updateElement(el.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                                            <span className="text-xs text-slate-500 uppercase">{el.color}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-600">Font Family</Label>
                                                    <select
                                                        className="w-full h-9 border rounded-md text-sm px-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        value={el.fontFamily}
                                                        onChange={e => updateElement(el.id, { fontFamily: e.target.value })}
                                                    >
                                                        <option value="sans-serif">Sans Serif</option>
                                                        <option value="serif">Serif</option>
                                                        <option value="monospace">Monospace</option>
                                                        <option value="cursive">Cursive</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-600">Font Weight</Label>
                                                    <select
                                                        className="w-full h-9 border rounded-md text-sm px-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        value={el.fontWeight || 'normal'}
                                                        onChange={e => updateElement(el.id, { fontWeight: e.target.value })}
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="bold">Bold</option>
                                                        <option value="light">Light</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        {el.type === 'image' && (
                                            <div className="space-y-3">
                                                {el.placeholderType && (
                                                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block font-medium mb-2">
                                                        Placeholder for: {el.placeholderType.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs font-semibold text-slate-600">Width</Label>
                                                        <Input type="number" value={el.width} onChange={e => updateElement(el.id, { width: parseInt(e.target.value) })} className="h-8 bg-white" />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs font-semibold text-slate-600">Height</Label>
                                                        <Input type="number" value={el.height} onChange={e => updateElement(el.id, { height: parseInt(e.target.value) })} className="h-8 bg-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Move size={24} className="mb-2 opacity-50" />
                            <p className="text-xs font-medium">Select an element to edit</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white">
                    <Button onClick={handleSave} disabled={saving} className="w-full bg-[#7E22CE] hover:bg-[#6B21A8] font-semibold h-10">
                        <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Template'}
                    </Button>
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-10 relative" ref={containerRef}>
                <div className="absolute top-6 right-8 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 z-20">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Zoom</span>
                    <input
                        type="range"
                        min="0.3"
                        max="1.5"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-mono w-12 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                <div
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center top',
                        transition: 'transform 0.1s ease-out'
                    }}
                    className="shadow-2xl ring-1 ring-black/5"
                >
                    <div
                        ref={certRef}
                        className="relative bg-white overflow-hidden select-none"
                        style={{ width: 1123, height: 794 }} // A4 Landscape
                        onClick={() => setSelectedId(null)}
                    >
                        {/* Grid/Guides Background (Optional) */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        ></div>

                        {elements.map(el => (
                            <div
                                key={el.id}
                                onMouseDown={(e) => handleMouseDown(e, el)}
                                style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: isDragging && selectedId === el.id ? 'grabbing' : 'grab',
                                    outline: selectedId === el.id ? '2px solid #3b82f6' : '1px dashed transparent',
                                    outlineOffset: '2px',
                                    padding: '4px' // padding for better selection click area
                                }}
                                className={selectedId === el.id ? "z-50" : "z-10 hover:outline-dashed hover:outline-slate-300"}
                            >
                                {el.type === 'text' && (
                                    <div style={{
                                        fontSize: el.fontSize,
                                        fontFamily: el.fontFamily,
                                        color: el.color,
                                        fontWeight: el.fontWeight || 'normal',
                                        width: el.width > 0 ? el.width : 'auto',
                                        textAlign: el.textAlign || 'center',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.2
                                    }}>
                                        {el.value}
                                    </div>
                                )}
                                {el.type === 'image' && (
                                    <div className="relative">
                                        <img
                                            src={el.value}
                                            style={{
                                                width: el.width,
                                                height: el.height,
                                                objectFit: 'contain',
                                                border: el.placeholderType ? '1px dashed #ccc' : 'none'
                                            }}
                                            draggable={false}
                                        />
                                        {el.placeholderType && (
                                            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] px-1 font-bold opacity-50 pointer-events-none">
                                                {el.placeholderType}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div>Loading Builder...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
