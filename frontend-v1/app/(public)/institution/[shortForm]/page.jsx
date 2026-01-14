'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/app/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Mail, MapPin, Link as LinkIcon, Loader2, BookOpen, Star } from 'lucide-react';
import { N } from '@/app/utils/notificationService';
import Link from 'next/link';

export default function PublicInstitutionPage() {
    const { shortForm } = useParams();
    const [institution, setInstitution] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const response = await axios.get(`/api/institutes/by-subdomain/${shortForm}`);
                if (response.status === 200) {
                    setInstitution(response.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
                N('Error', 'Institution not found', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (shortForm) {
            fetchInstitution();
        }
    }, [shortForm]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institution Not Found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
            {/* Hero Section */}
            <div className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {institution.logo && (
                            <div className="flex-shrink-0">
                                <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-white dark:border-zinc-800 shadow-xl bg-white">
                                    <AvatarImage
                                        src={institution.logo}
                                        alt={institution.name}
                                        className="object-contain"
                                    />
                                    <AvatarFallback className="text-5xl font-bold">{institution.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                        <div className="text-center md:text-left space-y-6 flex-1">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {institution.name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-base text-gray-600 dark:text-gray-400">
                                {institution.institutionAddress && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" /> {institution.institutionAddress}
                                    </span>
                                )}
                                {institution.contactNumber && (
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-primary" /> {institution.contactNumber}
                                    </span>
                                )}
                                {institution.websiteLink && (
                                    <a
                                        href={institution.websiteLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline transition-all"
                                    >
                                        <Globe className="h-5 w-5" /> Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

                {/* Top Courses Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Courses</h2>
                        {/* <Button variant="outline">View All</Button> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {institution.courses && institution.courses.length > 0 ? (
                            institution.courses.map((course) => (
                                <Link href={`/courses/${course.id}/play`} key={course.id} className="group h-full">
                                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white dark:bg-zinc-900 flex flex-col">
                                        <div className="aspect-video relative overflow-hidden">
                                            <img
                                                src={course.featuredImage?.startsWith('http') ? course.featuredImage : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${course.featuredImage}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <Badge className={`${course.pricingModel === 'free' ? "bg-green-500" : "bg-blue-600"} text-white border-0 px-3 py-1`}>
                                                    {course.pricingModel === 'free' ? 'Free' : `$${course.salePrice || course.regularPrice}`}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md"><BookOpen className="w-3.5 h-3.5" /> {course.difficultyLevel}</span>
                                                <span className="flex items-center gap-1.5 font-medium text-yellow-600 dark:text-yellow-400"><Star className="w-3.5 h-3.5 fill-current" /> {course.avgRating ? Number(course.avgRating).toFixed(1) : 'New'}</span>
                                            </div>
                                            <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100">
                                                {course.title}
                                            </h3>
                                            <div className="mt-auto pt-4 flex items-center gap-3 border-t dark:border-zinc-800">
                                                <Avatar className="h-9 w-9 border dark:border-zinc-700">
                                                    <AvatarImage src={course.instructor?.profile?.pPic} />
                                                    <AvatarFallback>{course.instructor?.profile?.name?.charAt(0) || 'I'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {course.instructor?.profile?.name || 'Instructor'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700">
                                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-xl font-medium">No courses available yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                <Separator className="my-12" />

                {/* About Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About Us</h2>
                            <div className="space-y-6">
                                {institution.vision && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                        <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-3">Our Vision</h3>
                                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                            {institution.vision}
                                        </p>
                                    </div>
                                )}
                                {institution.mission && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50">
                                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">Our Mission</h3>
                                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                            {institution.mission}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    {institution.images && institution.images.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {institution.images.map((img, index) => (
                                    <div key={index} className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-video group cursor-pointer">
                                        <img
                                            src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${img}`}
                                            alt={`Gallery ${index}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <Separator className="my-12" />

                {/* Contact Section */}
                <section className="bg-white dark:bg-zinc-900 rounded-2xl p-8 md:p-12 shadow-sm border dark:border-zinc-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                Have questions? We'd love to hear from you. Reach out to us through any of the following channels.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Address</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{institution.institutionAddress || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Email / Phone</h4>
                                        <p className="text-gray-600 dark:text-gray-400">{institution.contactNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Globe className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Website</h4>
                                        {institution.websiteLink ? (
                                            <a href={institution.websiteLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-lg">
                                                {institution.websiteLink}
                                            </a>
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-400">Not provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-6">
                            {/* Social / Other Links */}
                            {institution.otherLinks && institution.otherLinks.length > 0 && (
                                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-8">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Connect With Us</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {institution.otherLinks.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="w-full justify-start h-auto py-4 px-6 text-base hover:bg-primary hover:text-white transition-colors"
                                                asChild
                                            >
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                    <LinkIcon className="mr-3 h-5 w-5" />
                                                    {link.label}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
