'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Globe, Plus, Trash2, Eye, Upload, X, Copy, Check, Loader2, ImageIcon } from 'lucide-react';
import { N } from '@/app/utils/notificationService';
import axios from '@/app/api/axios';
import { setAuthUser } from '@/app/store';
import { getAuthUser } from '@/app/utils/auth';
import { DragDropFileUpload } from '@/app/Components/DragDropFileUpload';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// List of countries for dropdown
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
    "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
    "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain",
    "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe"
];

// Generate year options from 1900 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

export default function AccountPage() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        email: '',
        contactNumber: '',
        founded: 2000,
        country: '',
        institutionAddress: '',
        addressLine2: '',
        websiteLink: '',
        otherLinks: [],
        about: '',
        mission: '',
        vision: ''
    });

    const [logo, setLogo] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);

    // Preview State
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user?.institution) {
            const inst = user.institution;
            setFormData({
                name: inst.name || '',
                tagline: inst.tagline || '',
                email: inst.email || '',
                contactNumber: inst.contactNumber || '',
                founded: inst.founded || 2000,
                country: inst.country || '',
                institutionAddress: inst.institutionAddress || '',
                addressLine2: inst.addressLine2 || '',
                websiteLink: inst.websiteLink || '',
                otherLinks: inst.otherLinks || [],
                about: inst.about || '',
                mission: inst.mission || '',
                vision: inst.vision || ''
            });
            setLogo(inst.logo);
            setGalleryImages(inst.images || []);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...formData.otherLinks];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, otherLinks: newLinks }));
    };

    const addLink = () => {
        setFormData(prev => ({
            ...prev,
            otherLinks: [...prev.otherLinks, '']
        }));
    };

    const removeLink = (index) => {
        const newLinks = formData.otherLinks.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, otherLinks: newLinks }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', type === 'logo' ? 'Institution' : 'InstitutionGallery');

        try {
            const response = await axios.post('/api/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                const url = response.data.publicUrl;
                if (type === 'logo') {
                    setLogo(url);
                } else {
                    setGalleryImages(prev => [...prev, url]);
                }
                N('Success', 'Image uploaded successfully', 'success');
            } else {
                N('Error', 'Upload failed', 'error');
            }
        } catch (error) {
            console.error(error);
            N('Error', 'Failed to upload image', 'error');
        }
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePreview = (url) => {
        setPreviewImage(url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`);
        setPreviewOpen(true);
    };

    const copyPublicLink = () => {
        if (typeof window !== 'undefined' && user?.institution?.shortForm) {
            const link = `${window.location.origin}/institution/${user.institution.shortForm}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            N('Success', 'Link copied to clipboard', 'success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                id: user.institution.id,
                ...formData,
                logo,
                images: galleryImages,
            };

            const response = await axios.post('/api/institutionUpdate', payload);

            if (response.data.success) {
                N('Success', 'Account details updated successfully', 'success');
                const authU = await getAuthUser();
                if (authU && authU.success) {
                    dispatch(setAuthUser(authU.user));
                }
            } else {
                N('Error', 'Failed to update details', 'error');
            }
        } catch (error) {
            console.error(error);
            N('Error', 'An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${img}`;
    };

    return (
        <div className=" mx-auto space-y-8 p-4 md:p-6  border ">
            {/* Header with Public Link */}
            <div className="flex  flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organization Account</h1>
                    <p className="text-muted-foreground text-sm">Manage your institution's profile and public presence.</p>
                </div>
                {user?.institution?.shortForm && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyPublicLink}>
                            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/institution/${user.institution.shortForm}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="mr-2 h-4 w-4" />
                                View Page
                            </a>
                        </Button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className=" space-y-8">
                {/* Section 1: Contact & Communication Info */}
                <div className=" rounded-xlp-6 space-y-6">
                    <h2 className="text-xl font-semibold  ">Contact & Communication Info</h2>

                    {/* Logo centered */}
                    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                        <DragDropFileUpload
                            onFileSelect={(file) => handleFileUpload({ target: { files: [file] } }, 'logo')}
                            selectedFile={logo ? { name: "Current Logo", previewUrl: getImageUrl(logo) } : null}
                            label="Upload Logo"
                            accept="image/*"
                         />
                    </div>

                    {/* Two column form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                placeholder="Enter Organization Name"
                                disabled
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleInputChange}
                                placeholder="e.g Empowering Future Leaders"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="e.g info@institution.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactNumber">Phone</Label>
                            <Input
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                placeholder="e.g +1 234 567 890"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="founded">Founded</Label>
                            <Select
                                value={String(formData.founded)}
                                onValueChange={(value) => handleSelectChange('founded', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => handleSelectChange('country', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="institutionAddress">Address Line 1</Label>
                            <Input
                                id="institutionAddress"
                                name="institutionAddress"
                                value={formData.institutionAddress}
                                onChange={handleInputChange}
                                placeholder="Enter full Address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input
                                id="addressLine2"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                placeholder="(optional)"
                            />
                        </div>
                    </div>

                    {/* Website - full width */}
                    <div className="space-y-2">
                        <Label htmlFor="websiteLink">Website (optional)</Label>
                        <Input
                            id="websiteLink"
                            name="websiteLink"
                            value={formData.websiteLink}
                            onChange={handleInputChange}
                            placeholder="Enter URL ..."
                        />
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-3">
                        <Label>Social Media Links (optional)</Label>
                        {formData.otherLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={link}
                                    onChange={(e) => handleLinkChange(index, e.target.value)}
                                    placeholder="Enter URL ..."
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLink(index)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addLink}>
                            <Plus className="mr-2 h-4 w-4" /> Add Link
                        </Button>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={loading} className="gradient-button px-8">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Change
                        </Button>
                    </div>
                </div>

                {/* Section 2: Overview */}
                <div className=" rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-4">Overview</h2>

                    <div className="space-y-2">
                        <Label htmlFor="about">About</Label>
                        <Textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            placeholder="Enter your Institution Details...."
                            rows={5}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mission">Mission</Label>
                        <Textarea
                            id="mission"
                            name="mission"
                            value={formData.mission}
                            onChange={handleInputChange}
                            placeholder="Enter your Institution Mission..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vision">Vision</Label>
                        <Textarea
                            id="vision"
                            name="vision"
                            value={formData.vision}
                            onChange={handleInputChange}
                            placeholder="Enter your Institution Vision...."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Change
                        </Button>
                    </div>
                </div>

                {/* Section 3: Images */}
                <div className=" rounded-xl  p-6 space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-4">Images</h2>

                    {/* Upload area */}
                    <div className="space-y-2">
                        <Label className="font-medium">Upload Images</Label>
                        <DragDropFileUpload
                            onFileSelect={(file) => handleFileUpload({ target: { files: [file] } }, 'gallery')}
                            label="Upload Gallery Image"
                            accept="image/*"
                        />
                    </div>

                    {/* Uploaded Images Gallery */}
                    {galleryImages.length > 0 && (
                        <div className="space-y-3">
                            <Label className="font-medium">Uploaded Images</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {galleryImages.map((img, index) => (
                                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted group">
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Gallery ${index}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Change
                        </Button>
                    </div>
                </div>
            </form>

            {/* Image Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-auto rounded-lg shadow-2xl"
                        />
                        <Button
                            className="absolute top-2 right-2 rounded-full"
                            size="icon"
                            variant="secondary"
                            onClick={() => setPreviewOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
