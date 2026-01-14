"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import Link from "next/link";

const MicrosoftGuidePage = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/integrations">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Integrations
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold mt-4">Microsoft Teams Integration Guide</h1>
                <p className="text-slate-500 mt-2">
                    Follow these steps to obtain your Client ID, Client Secret, and Tenant ID from the Azure Portal.
                </p>
            </div>

            <div className="space-y-8">
                {/* Step 1 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Register an Application in Azure Portal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            1. Go to the <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Azure Portal - App Registrations <ExternalLink className="ml-1 h-3 w-3" /></a>.
                        </p>
                        <p>2. Click on <strong>"New registration"</strong>.</p>
                        <p>3. Fill in the details:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-700">
                            <li><strong>Name:</strong> Enter a name (e.g., "LMS Teams Integration").</li>
                            <li><strong>Supported account types:</strong> Select "Accounts in this organizational directory only" (Single tenant) if this is for your internal organization, or "Accounts in any organizational directory" (Multitenant) if you are building a SaaS platform.</li>
                            <li><strong>Redirect URI (Web):</strong> Enter your callback URL. For local development, use:
                                <code className="bg-slate-100 px-2 py-1 rounded ml-2 text-sm">http://localhost:3333/api/admin/microsoft/callback</code>
                                <br />
                                <span className="text-xs text-slate-500">Note: Replace `http://localhost:3333` with your production backend URL when deploying.</span>
                            </li>
                        </ul>
                        <p>4. Click <strong>"Register"</strong>.</p>
                    </CardContent>
                </Card>

                {/* Step 2 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Copy IDs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>On the Overview page of your newly created app, copy the following values:</p>
                        <div className="grid gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <p className="text-sm font-medium text-slate-500">Application (client) ID</p>
                                <p className="font-mono text-lg select-all">Your Client ID</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <p className="text-sm font-medium text-slate-500">Directory (tenant) ID</p>
                                <p className="font-mono text-lg select-all">Your Tenant ID</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Create a Client Secret</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>1. In the left menu, click on <strong>"Certificates & secrets"</strong>.</p>
                        <p>2. Click <strong>"New client secret"</strong>.</p>
                        <p>3. Add a description and choose an expiration period (e.g., 24 months).</p>
                        <p>4. Click <strong>"Add"</strong>.</p>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                            <p className="text-amber-700 text-sm">
                                <strong>Important:</strong> Copy the <strong>"Value"</strong> immediately. You will not be able to see it again after you leave the page. This is your <strong>Client Secret</strong>.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 4 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Step 4: Add API Permissions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>1. In the left menu, click on <strong>"API permissions"</strong>.</p>
                        <p>2. Click <strong>"Add a permission"</strong> -&gt; <strong>"Microsoft Graph"</strong> -&gt; <strong>"Delegated permissions"</strong>.</p>
                        <p>3. Search for and select the following permissions:</p>
                        <ul className="list-disc pl-6 space-y-1 text-slate-700 font-mono text-sm">
                            <li>OnlineMeetings.ReadWrite</li>
                            <li>offline_access</li>
                            <li>User.Read (default)</li>
                        </ul>
                        <p>4. Click <strong>"Add permissions"</strong>.</p>
                        <p>5. (Optional but recommended) Click <strong>"Grant admin consent for [Your Org]"</strong> to suppress consent prompts for users.</p>
                    </CardContent>
                </Card>

                <div className="flex justify-center pt-8">
                    <Link href="/admin/integrations">
                        <Button size="lg" className="bg-[#464EB8] hover:bg-[#3b429c]">
                            I have my credentials
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MicrosoftGuidePage;
