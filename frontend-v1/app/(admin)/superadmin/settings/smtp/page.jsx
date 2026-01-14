"use client";
import React, { useState, useEffect } from "react";
import axios from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, Save } from "lucide-react";

export default function SmtpSettingsPage() {
    const [formData, setFormData] = useState({
        host: "",
        port: "",
        username: "",
        password: "",
        encryption: "tls",
        from_address: "",
        from_name: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get("/api/super-admin/smtp-settings");
            if (response.data) {
                setFormData({
                    host: response.data.host || "",
                    port: response.data.port || "",
                    username: response.data.username || "",
                    password: response.data.password || "",
                    encryption: response.data.encryption || "tls",
                    from_address: response.data.from_address || "",
                    from_name: response.data.from_name || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post("/api/super-admin/smtp-settings", formData);
            toast.success("SMTP Settings updated successfully");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error("Please enter an email to test");
            return;
        }
        setTesting(true);
        try {
            await axios.post("/api/super-admin/smtp-settings/test", { email: testEmail });
            toast.success("Test email sent successfully!");
        } catch (error) {
            console.error("Test email failed", error);
            toast.error("Failed to send test email: " + (error.response?.data?.message || error.message));
        } finally {
            setTesting(false);
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SMTP Configuration</h1>
                <p className="text-muted-foreground">Manage your email server settings and credentials.</p>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Server Settings</CardTitle>
                            <CardDescription>Enter the connection details for your SMTP provider (e.g., Gmail, SendGrid, Mailgun).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="host">SMTP Host</Label>
                                        <Input id="host" name="host" value={formData.host} onChange={handleChange} placeholder="smtp.example.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="port">Port</Label>
                                        <Input id="port" name="port" value={formData.port} onChange={handleChange} placeholder="587" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="encryption">Encryption</Label>
                                    <Select onValueChange={(val) => handleSelectChange('encryption', val)} value={formData.encryption}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select encryption" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS (Recommended)</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="user@example.com" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold mb-3">Sender Identity</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="from_name">Sender Name</Label>
                                            <Input id="from_name" name="from_name" value={formData.from_name} onChange={handleChange} placeholder="Global Vine Support" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="from_address">Sender Email</Label>
                                            <Input id="from_address" name="from_address" value={formData.from_address} onChange={handleChange} placeholder="support@globalvine.com" required />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving} className="w-full">
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Configuration
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Connection</CardTitle>
                            <CardDescription>Send a test email to verify your settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Recipient Email</Label>
                                <Input
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <Button variant="secondary" onClick={handleTestEmail} disabled={testing} className="w-full">
                                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                Send Test Email
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
