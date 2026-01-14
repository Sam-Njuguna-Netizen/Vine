"use client";

import { useState } from "react";
import { Button, Collapse } from "antd";
import {
  MailOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link"; // Import Next.js Link for internal navigation

const { Panel } = Collapse;

export default function PrivacyPolicyPage() {
  const [activeKey, setActiveKey] = useState(["1"]); // Default open section

  // Assuming your ThemeProvider is already wrapping the app and handling
  // the 'dark' class on <html> and AntD's ConfigProvider theme.
  // No direct use of useTheme() is needed in this component for styling if
  // Tailwind classes and ConfigProvider do their job.

  const handlePanelChange = (keys) => {
    setActiveKey(keys);
  };

  return (
    <div className="min-h-screen dark:bg-slate-700  text-slate-700 dark:text-slate-300 px-0 py-8 md:px-8 md:py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: April 14, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8 p-6   rounded-lg shadow-md">
          <p className="mb-4 text-slate-600 dark:text-slate-300">
            This Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your information when You use the
            Service and tells You about Your privacy rights and how the law
            protects You.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            We use Your Personal data to provide and improve the Service. By
            using the Service, You agree to the collection and use of
            information in accordance with this Privacy Policy.
          </p>
        </section>

        {/* Collapsible Sections */}
        <Collapse
          activeKey={activeKey}
          onChange={handlePanelChange}
          bordered={false}
          className="bg-transparent site-collapse-custom-collapse" // Custom class for potential global overrides if needed
          expandIconPosition="end"
          // AntD Collapse styling will primarily come from ConfigProvider
        >
          {/* Interpretation and Definitions */}
          <Panel
            header={
              <p className="text-xl font-semibold m-0 text-slate-800 dark:text-slate-100">
                Interpretation and Definitions
              </p>
            }
            key="1"
            className="mb-4   rounded-lg shadow-md site-collapse-custom-panel"
          >
            <div className="pl-4 md:pl-6 pt-2 pb-4 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Interpretation
              </h3>
              <p className="mb-6">
                The words of which the initial letter is capitalized have
                meanings defined under the following conditions. The following
                definitions shall have the same meaning regardless of whether
                they appear in singular or in plural.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Definitions
              </h3>
              <p className="mb-4">For the purposes of this Privacy Policy:</p>

              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Account</strong> means a unique account created for
                  You to access our Service or parts of our Service.
                </li>
                <li>
                  <strong>Affiliate</strong> means an entity that controls, is
                  controlled by or is under common control with a party.
                </li>
                <li>
                  <strong>Company</strong> (referred to as either "the Company",
                  "We", "Us" or "Our" in this Agreement) refers to Vine.
                </li>
                <li>
                  <strong>Cookies</strong> are small files that are placed on
                  Your computer, mobile device or any other device by a website.
                </li>
                <li>
                  <strong>Country</strong> refers to: New York, United States.
                </li>
                <li>
                  <strong>Device</strong> means any device that can access the
                  Service such as a computer, a cellphone or a digital tablet.
                </li>
                <li>
                  <strong>Personal Data</strong> is any information that relates
                  to an identified or identifiable individual.
                </li>
                <li>
                  <strong>Service</strong> refers to the Website.
                </li>
                <li>
                  <strong>Service Provider</strong> means any natural or legal
                  person who processes the data on behalf of the Company.
                </li>
                <li>
                  <strong>Third-party Social Media Service</strong> refers to
                  any website or any social network website through which a User
                  can log in.
                </li>
                <li>
                  <strong>Usage Data</strong> refers to data collected
                  automatically, either generated by the use of the Service.
                </li>
                <li>
                  <strong>Website</strong> refers to Vine, accessible from{" "}
                  <Link
                    href="/"
                    className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Here
                  </Link>
                </li>
                <li>
                  <strong>You</strong> means the individual accessing or using
                  the Service.
                </li>
              </ul>
            </div>
          </Panel>

          {/* Collecting and Using Your Personal Data */}
          <Panel
            header={
              <p className="text-xl font-semibold m-0 text-slate-800 dark:text-slate-100">
                Collecting and Using Your Personal Data
              </p>
            }
            key="2"
            className="mb-4   rounded-lg shadow-md site-collapse-custom-panel"
          >
            <div className="pl-4 md:pl-6 pt-2 pb-4 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Types of Data Collected
              </h3>

              <h4 className="font-semibold mt-3 mb-2 text-slate-700 dark:text-slate-200">
                Personal Data
              </h4>
              <p className="mb-4">
                While using Our Service, We may ask You to provide Us with
                certain personally identifiable information that can be used to
                contact or identify You. Personally identifiable information may
                include, but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
                <li>Usage Data</li>
              </ul>

              <h4 className="font-semibold mt-3 mb-2 text-slate-700 dark:text-slate-200">
                Usage Data
              </h4>
              <p className="mb-4">
                Usage Data is collected automatically when using the Service.
                Usage Data may include information such as Your Device's
                Internet Protocol address (e.g. IP address), browser type,
                browser version, the pages of our Service that You visit, the
                time and date of Your visit, the time spent on those pages,
                unique device identifiers and other diagnostic data.
              </p>

              <h4 className="font-semibold mt-3 mb-2 text-slate-700 dark:text-slate-200">
                Tracking Technologies and Cookies
              </h4>
              <p className="mb-4">
                We use Cookies and similar tracking technologies to track the
                activity on Our Service and store certain information. Tracking
                technologies used are beacons, tags, and scripts to collect and
                track information and to improve and analyze Our Service.
              </p>
              <p className="mb-6">
                For more information about the cookies we use and your choices
                regarding cookies, please visit our Cookies Policy or the
                Cookies section of our Privacy Policy.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Use of Your Personal Data
              </h3>
              <p className="mb-4">
                The Company may use Personal Data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our Service</li>
                <li>To manage Your Account</li>
                <li>For the performance of a contract</li>
                <li>To contact You</li>
                <li>
                  To provide You with news, special offers and general
                  information
                </li>
                <li>To manage Your requests</li>
                <li>For business transfers</li>
                <li>For other purposes</li>
              </ul>
            </div>
          </Panel>

          {/* Data Retention, Transfer & Security */}
          <Panel
            header={
              <p className="text-xl font-semibold m-0 text-slate-800 dark:text-slate-100">
                Data Retention, Transfer & Security
              </p>
            }
            key="3"
            className="mb-4   rounded-lg shadow-md site-collapse-custom-panel"
          >
            <div className="pl-4 md:pl-6 pt-2 pb-4 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Retention of Your Personal Data
              </h3>
              <p className="mb-6">
                The Company will retain Your Personal Data only for as long as
                is necessary for the purposes set out in this Privacy Policy. We
                will retain and use Your Personal Data to the extent necessary
                to comply with our legal obligations, resolve disputes, and
                enforce our legal agreements and policies.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Transfer of Your Personal Data
              </h3>
              <p className="mb-6">
                Your information, including Personal Data, is processed at the
                Company's operating offices and in any other places where the
                parties involved in the processing are located. It means that
                this information may be transferred to — and maintained on —
                computers located outside of Your state, province, country or
                other governmental jurisdiction where the data protection laws
                may differ than those from Your jurisdiction.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Security of Your Personal Data
              </h3>
              <p>
                The security of Your Personal Data is important to Us, but
                remember that no method of transmission over the Internet, or
                method of electronic storage is 100% secure. While We strive to
                use commercially acceptable means to protect Your Personal Data,
                We cannot guarantee its absolute security.
              </p>
            </div>
          </Panel>

          {/* Children's Privacy & Links */}
          <Panel
            header={
              <p className="text-xl font-semibold m-0 text-slate-800 dark:text-slate-100">
                Children's Privacy & Links
              </p>
            }
            key="4"
            className="mb-4   rounded-lg shadow-md site-collapse-custom-panel"
          >
            <div className="pl-4 md:pl-6 pt-2 pb-4 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Children's Privacy
              </h3>
              <p className="mb-6">
                Our Service does not address anyone under the age of 13. We do
                not knowingly collect personally identifiable information from
                anyone under the age of 13. If You are a parent or guardian and
                You are aware that Your child has provided Us with Personal
                Data, please contact Us.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Links to Other Websites
              </h3>
              <p>
                Our Service may contain links to other websites that are not
                operated by Us. If You click on a third party link, You will be
                directed to that third party's site. We strongly advise You to
                review the Privacy Policy of every site You visit.
              </p>
            </div>
          </Panel>

          {/* Policy Changes & Contact */}
          <Panel
            header={
              <p className="text-xl font-semibold m-0 text-slate-800 dark:text-slate-100">
                Policy Changes & Contact
              </p>
            }
            key="5"
            className="  rounded-lg shadow-md site-collapse-custom-panel" // Last panel, no mb-4
          >
            <div className="pl-4 md:pl-6 pt-2 pb-4 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Changes to this Privacy Policy
              </h3>
              <p className="mb-6">
                We may update Our Privacy Policy from time to time. We will
                notify You of any changes by posting the new Privacy Policy on
                this page. You are advised to review this Privacy Policy
                periodically for any changes.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700 dark:text-slate-200">
                Contact Us
              </h3>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, You can
                contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  icon={<MailOutlined />}
                  href="mailto:info@vinelms.com"
                  className="flex items-center justify-center sm:justify-start"
                  // AntD Button theming will be handled by ConfigProvider
                >
                  info@vinelms.com
                </Button>
                <Link href="/support"  >
                  <Button
                    icon={<GlobalOutlined />}
                    className="flex items-center justify-center sm:justify-start"
                  >
                    Visit Support Page
                  </Button>
                </Link>
              </div>
            </div>
          </Panel>
        </Collapse>

        {/* Quick Actions */}
        <div className="mt-10 md:mt-12 flex flex-wrap gap-4 justify-center">
          <Link href="/support"  >
            <Button
              type="primary"
              icon={<QuestionCircleOutlined />}
              size="large"
            >
              Contact Support
            </Button>
          </Link>
          <Button
            icon={<MailOutlined />}
            href="mailto:info@vinelms.com"
            size="large"
          >
            Email Us
          </Button>
        </div>
      </div>
      {/* Minimal global style for AntD Collapse Panel if ConfigProvider isn't enough */}
      <style jsx global>{`
        .site-collapse-custom-collapse
          .site-collapse-custom-panel
          .ant-collapse-content-box {
          padding-left: 0px !important; /* Adjust if default padding is too much with custom pl classes */
          padding-right: 0px !important;
        }
        .site-collapse-custom-collapse .ant-collapse-header {
          padding-left: 1.5rem !important; /* Corresponds to p-6 on Panel */
          padding-right: 1.5rem !important;
          padding-top: 1rem !important;
          padding-bottom: 1rem !important;
          align-items: center !important; /* Vertically align header text with icon */
        }
        /* Ensure hover/focus states for collapse headers are themed by AntD */
      `}</style>
    </div>
  );
}
