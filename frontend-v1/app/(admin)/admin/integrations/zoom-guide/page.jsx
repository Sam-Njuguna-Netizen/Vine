"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ZoomGuidePage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/integrations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">How to Get Zoom Credentials</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Create a Server-to-Server OAuth App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            To connect Zoom with this platform, you need to create a <strong>Server-to-Server OAuth</strong> app in the Zoom App Marketplace.
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Go to the <a href="https://marketplace.zoom.us/" target="_blank" className="text-blue-600 hover:underline">Zoom App Marketplace</a> and sign in with your Zoom account.</li>
            <li>Click on <strong>Develop</strong> in the top right corner and select <strong>Build App</strong>.</li>
            <li>Find <strong>Server-to-Server OAuth</strong> and click <strong>Create</strong>.</li>
            <li>Enter a name for your app (e.g., "LMS Integration") and click <strong>Create</strong>.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Get Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Once the app is created, you will see your credentials on the <strong>App Credentials</strong> page.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Account ID</strong></li>
            <li><strong>Client ID</strong></li>
            <li><strong>Client Secret</strong></li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Copy these values. You will need to paste them into the integration settings on this platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Add Scopes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You need to give the app permission to manage meetings.
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Go to the <strong>Scopes</strong> tab in the left sidebar.</li>
            <li>Click <strong>Add Scopes</strong>.</li>
            <li>Select <strong>Meeting</strong> and check the box for <code>meeting:write:admin</code> (or <code>meeting:write</code>).</li>
            <li>Click <strong>Done</strong>.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 4: Activate App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Finally, you must activate the app for it to work.
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Go to the <strong>Activation</strong> tab.</li>
            <li>Click <strong>Activate your app</strong>.</li>
          </ol>
          <p className="mt-4 text-green-600 font-medium">
            Your Zoom integration is now ready to use!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoomGuidePage;
