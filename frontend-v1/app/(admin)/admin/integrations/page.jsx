"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGooglemeet, SiZoom, SiJitsi } from "react-icons/si";
import { PiMicrosoftTeamsLogo as SiMicrosoftteams } from "react-icons/pi";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

const IntegrationsPage = () => {
  const [googleStatus, setGoogleStatus] = React.useState({ connected: false, email: null });
  const [zoomStatus, setZoomStatus] = React.useState({ connected: false, accountId: null });
  const [microsoftStatus, setMicrosoftStatus] = React.useState({ connected: false, tenantId: null });
  const [loading, setLoading] = React.useState(true);

  // Zoom Form State
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [zoomFormData, setZoomFormData] = React.useState({
    accountId: "",
    clientId: "",
    clientSecret: "",
  });

  // Microsoft Form State
  const [microsoftOpen, setMicrosoftOpen] = React.useState(false);
  const [microsoftFormData, setMicrosoftFormData] = React.useState({
    clientId: "",
    clientSecret: "",
    tenantId: "",
  });

  // Jitsi Form State
  const [jitsiStatus, setJitsiStatus] = React.useState({ connected: false, appId: null });
  const [jitsiOpen, setJitsiOpen] = React.useState(false);
  const [jitsiFormData, setJitsiFormData] = React.useState({
    appId: "",
    apiKeyId: "",
    privateKey: "",
  });

  React.useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const [googleRes, zoomRes, microsoftRes, jitsiRes] = await Promise.all([
        axiosInstance.get('/api/admin/google/status'),
        axiosInstance.get('/api/admin/zoom/status'),
        axiosInstance.get('/api/admin/microsoft/status'),
        axiosInstance.get('/api/admin/jitsi/status')
      ]);
      setGoogleStatus(googleRes.data);
      setZoomStatus(zoomRes.data);
      setMicrosoftStatus(microsoftRes.data);
      setJitsiStatus(jitsiRes.data);
    } catch (error) {
      console.error("Failed to fetch integration status", error);
    } finally {
      setLoading(false);
    }
  };

  // Google Handlers
  const handleConnectGoogle = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/google/redirect`);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Failed to get auth URL", error);
      N("Error", "Failed to initiate Google connection", "error");
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await axiosInstance.post('/api/admin/google/disconnect');
      fetchStatus();
      N("Success", "Google disconnected successfully", "success");
    } catch (error) {
      console.error("Failed to disconnect", error);
      N("Error", "Failed to disconnect Google", "error");
    }
  };

  // Zoom Handlers
  const handleConnectZoom = async () => {
    try {
      await axiosInstance.post('/api/admin/zoom/connect', zoomFormData);
      setZoomOpen(false);
      fetchStatus();
      N("Success", "Zoom connected successfully", "success");
    } catch (error) {
      console.error("Failed to connect Zoom", error);
      N("Error", "Failed to connect Zoom. Please check credentials.", "error");
    }
  };

  const handleDisconnectZoom = async () => {
    try {
      await axiosInstance.post('/api/admin/zoom/disconnect');
      fetchStatus();
      N("Success", "Zoom disconnected successfully", "success");
    } catch (error) {
      console.error("Failed to disconnect Zoom", error);
      N("Error", "Failed to disconnect Zoom", "error");
    }
  };

  // Microsoft Handlers
  const handleConnectMicrosoft = async () => {
    try {
      const response = await axiosInstance.post('/api/admin/microsoft/connect', microsoftFormData);
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Failed to initiate Microsoft connection", error);
      N("Error", "Failed to initiate Microsoft connection", "error");
    }
  };

  const handleDisconnectMicrosoft = async () => {
    try {
      await axiosInstance.post('/api/admin/microsoft/disconnect');
      fetchStatus();
      N("Success", "Microsoft Teams disconnected successfully", "success");
    } catch (error) {
      console.error("Failed to disconnect Microsoft", error);
      N("Error", "Failed to disconnect Microsoft Teams", "error");
    }
  };

  // Jitsi Handlers
  const handleConnectJitsi = async () => {
    try {
      await axiosInstance.post('/api/admin/jitsi/connect', jitsiFormData);
      setJitsiOpen(false);
      fetchStatus();
      N("Success", "Jitsi connected successfully", "success");
    } catch (error) {
      console.error("Failed to connect Jitsi", error);
      N("Error", "Failed to connect Jitsi. Please check credentials.", "error");
    }
  };

  const handleDisconnectJitsi = async () => {
    try {
      await axiosInstance.post('/api/admin/jitsi/disconnect');
      fetchStatus();
      N("Success", "Jitsi disconnected successfully", "success");
    } catch (error) {
      console.error("Failed to disconnect Jitsi", error);
      N("Error", "Failed to disconnect Jitsi", "error");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Google Meet Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Meet</CardTitle>
            <SiGooglemeet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : googleStatus.connected ? "Connected" : "Connect Account"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {googleStatus.connected
                ? `Connected as ${googleStatus.email}. You can now generate Google Meet links.`
                : "Connect your Google account to generate Google Meet links for live classes."}
            </p>
            {!loading && (
              googleStatus.connected ? (
                <Button onClick={handleDisconnectGoogle} variant="destructive" className="mt-4 w-full">
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnectGoogle} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                  Connect Google
                </Button>
              )
            )}
          </CardContent>
        </Card>

        {/* Zoom Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zoom</CardTitle>
            <SiZoom className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : zoomStatus.connected ? "Connected" : "Connect Account"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {zoomStatus.connected
                ? `Connected (Account ID: ${zoomStatus.accountId}). You can now generate Zoom links.`
                : "Connect your Zoom account to generate Zoom links for live classes."}
            </p>
            {!loading && (
              zoomStatus.connected ? (
                <Button onClick={handleDisconnectZoom} variant="destructive" className="mt-4 w-full">
                  Disconnect
                </Button>
              ) : (
                <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 w-full bg-blue-500 hover:bg-blue-600">
                      Connect Zoom
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Connect Zoom</DialogTitle>
                      <DialogDescription>
                        Enter your Zoom Server-to-Server OAuth credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="accountId" className="text-right">Account ID</Label>
                        <Input id="accountId" value={zoomFormData.accountId} onChange={(e) => setZoomFormData({ ...zoomFormData, accountId: e.target.value })} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="clientId" className="text-right">Client ID</Label>
                        <Input id="clientId" value={zoomFormData.clientId} onChange={(e) => setZoomFormData({ ...zoomFormData, clientId: e.target.value })} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="clientSecret" className="text-right">Client Secret</Label>
                        <Input id="clientSecret" type="password" value={zoomFormData.clientSecret} onChange={(e) => setZoomFormData({ ...zoomFormData, clientSecret: e.target.value })} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleConnectZoom}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            )}
          </CardContent>
        </Card>

        {/* Microsoft Teams Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Microsoft Teams</CardTitle>
            {/* Change <SIwindow ... /> to the new icon name */}
            <SiMicrosoftteams className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : microsoftStatus.connected ? "Connected" : "Connect Account"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {microsoftStatus.connected
                ? `Connected (Tenant ID: ${microsoftStatus.tenantId}). You can now generate Teams links.`
                : "Connect your Microsoft account to generate Teams links for live classes."}
            </p>
            {!loading && (
              microsoftStatus.connected ? (
                <Button onClick={handleDisconnectMicrosoft} variant="destructive" className="mt-4 w-full">
                  Disconnect
                </Button>
              ) : (
                <Dialog open={microsoftOpen} onOpenChange={setMicrosoftOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 w-full bg-[#464EB8] hover:bg-[#3b429c]">
                      Connect Teams
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Connect Microsoft Teams</DialogTitle>
                      <DialogDescription>
                        Enter your Azure App credentials (Delegated Permissions). <a href="/admin/integrations/microsoft-guide" className="text-blue-600 hover:underline" target="_blank">How to get these?</a>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="msClientId" className="text-right">Client ID</Label>
                        <Input id="msClientId" value={microsoftFormData.clientId} onChange={(e) => setMicrosoftFormData({ ...microsoftFormData, clientId: e.target.value })} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="msClientSecret" className="text-right">Client Secret</Label>
                        <Input id="msClientSecret" type="password" value={microsoftFormData.clientSecret} onChange={(e) => setMicrosoftFormData({ ...microsoftFormData, clientSecret: e.target.value })} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="msTenantId" className="text-right">Tenant ID</Label>
                        <Input id="msTenantId" value={microsoftFormData.tenantId} onChange={(e) => setMicrosoftFormData({ ...microsoftFormData, tenantId: e.target.value })} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleConnectMicrosoft}>Connect</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            )}
          </CardContent>
        </Card>

        {/* Jitsi Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jitsi / 8x8</CardTitle>
            <SiJitsi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : jitsiStatus.connected ? "Connected" : "Connect Account"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {jitsiStatus.connected
                ? `Connected (App ID: ${jitsiStatus.appId}). You can now generate Jitsi links.`
                : "Connect your 8x8 Jitsi account to generate meeting links."}
            </p>
            {!loading && (
              jitsiStatus.connected ? (
                <Button onClick={handleDisconnectJitsi} variant="destructive" className="mt-4 w-full">
                  Disconnect
                </Button>
              ) : (
                <Dialog open={jitsiOpen} onOpenChange={setJitsiOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                      Connect Jitsi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Connect Jitsi / 8x8</DialogTitle>
                      <DialogDescription>
                        Enter your 8x8 Jitsi as a Service credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="appId" className="text-right">App ID</Label>
                        <Input id="appId" value={jitsiFormData.appId} onChange={(e) => setJitsiFormData({ ...jitsiFormData, appId: e.target.value })} className="col-span-3" placeholder="vpaas-magic-cookie-..." />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKeyId" className="text-right">API Key ID</Label>
                        <Input id="apiKeyId" value={jitsiFormData.apiKeyId} onChange={(e) => setJitsiFormData({ ...jitsiFormData, apiKeyId: e.target.value })} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="privateKey" className="text-right">Private Key</Label>
                        <Textarea id="privateKey" value={jitsiFormData.privateKey} onChange={(e) => setJitsiFormData({ ...jitsiFormData, privateKey: e.target.value })} className="col-span-3 min-h-[100px]" placeholder="-----BEGIN PRIVATE KEY-----..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleConnectJitsi}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;
