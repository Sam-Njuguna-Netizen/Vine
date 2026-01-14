"use client";
// No specific imports needed for this page's dark mode other than what might be in a global layout
// (e.g. ThemeProvider ensuring 'dark' class on <html>)

export default function TermsAndConditions() {
  return (
    // Added a container for consistent padding, max-width, and page background colors
    <div className="min-h-screen  dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-0 py-8 md:px-8 md:py-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {" "}
        {/* Max width for readability */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white text-center">
          Terms and Conditions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 text-center">
          Last updated: April 29, 2025
        </p>
        {/* Section: Interpretation and Definitions */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Interpretation and Definitions
          </h2>

          <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-200">
            Interpretation
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            The words of which the initial letter is capitalized have meanings
            defined under the following conditions. The following definitions
            shall have the same meaning regardless of whether they appear in
            singular or in plural.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-200">
            Definitions
          </h3>
          <p className="mb-3 text-slate-600 dark:text-slate-300">
            For the purposes of these Terms and Conditions:
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Application
              </strong>{" "}
              means the software program provided by the Company downloaded by
              You on any electronic device, named Vine
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Application Store
              </strong>{" "}
              means the digital distribution service operated by Apple Inc.
              (Apple App Store) or Google Inc. (Google Play Store).
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Affiliate
              </strong>{" "}
              means an entity that controls, is controlled by or is under common
              control with a party.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Country
              </strong>{" "}
              refers to: Delaware, United States
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Company
              </strong>{" "}
              (referred to as either "the Company", "We", "Us" or "Our" in this
              Agreement) refers to Vine LMS LLC, 8 The Green STE B Dover, DE
              19901.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Device
              </strong>{" "}
              means any device that can access the Service such as a computer, a
              cellphone or a digital tablet.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Service
              </strong>{" "}
              refers to the Application or the Website or both.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Terms and Conditions
              </strong>{" "}
              (also referred as "Terms") mean these Terms and Conditions that
              form the entire agreement between You and the Company regarding
              the use of the Service.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Third-party Social Media Service
              </strong>{" "}
              means any services or content (including data, information,
              products or services) provided by a third-party that may be
              displayed, included or made available by the Service.
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                Website
              </strong>{" "}
              refers to Vine, accessible from{" "}
              <a
                href="https://www.vinelms.com"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.vinelms.com
              </a>
            </li>
            <li>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">
                You
              </strong>{" "}
              means the individual accessing or using the Service, or the
              company, or other legal entity on behalf of which such individual
              is accessing or using the Service, as applicable.
            </li>
          </ul>
        </section>
        {/* Section: Acknowledgment */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Acknowledgment
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            These are the Terms and Conditions governing the use of this Service
            and the agreement that operates between You and the Company. These
            Terms and Conditions set out the rights and obligations of all users
            regarding the use of the Service. Your access to and use of the
            Service is conditioned on Your acceptance of and compliance with
            these Terms and Conditions. These Terms and Conditions apply to all
            visitors, users and others who access or use the Service. By
            accessing or using the Service You agree to be bound by these Terms
            and Conditions. If You disagree with any part of these Terms and
            Conditions then You may not access the Service.
          </p>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            You represent that you are over the age of 18. The Company does not
            permit those under 18 to use the Service.
          </p>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            Your access to and use of the Service is also conditioned on Your
            acceptance of and compliance with the Privacy Policy of the Company.
            Our Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your personal information when You
            use the Application or the Website and tells You about Your privacy
            rights and how the law protects You. Please read Our{" "}
            <a
              href="/privacyPolicy"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Privacy Policy
            </a>{" "}
            carefully before using Our Service.
          </p>
        </section>
        {/* Section: Links to Other Websites */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Links to Other Websites
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            Our Service may contain links to third-party web sites or services
            that are not owned or controlled by the Company. The Company has no
            control over, and assumes no responsibility for, the content,
            privacy policies, or practices of any third party web sites or
            services. You further acknowledge and agree that the Company shall
            not be responsible or liable, directly or indirectly, for any damage
            or loss caused or alleged to be caused by or in connection with the
            use of or reliance on any such content, goods or services available
            on or through any such web sites or services. We strongly advise You
            to read the terms and conditions and privacy policies of any
            third-party web sites or services that You visit.
          </p>
        </section>
        {/* Section: Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Termination
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            We may terminate or suspend Your access immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if You breach these Terms and Conditions. Upon
            termination, Your right to use the Service will cease immediately.
          </p>
        </section>
        {/* Section: Limitation of Liability */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Limitation of Liability
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            Notwithstanding any damages that You might incur, the entire
            liability of the Company and any of its suppliers under any
            provision of this Terms and Your exclusive remedy for all of the
            foregoing shall be limited to the amount actually paid by You
            through the Service or 100 USD if You haven't purchased anything
            through the Service. To the maximum extent permitted by applicable
            law, in no event shall the Company or its suppliers be liable for
            any special, incidental, indirect, or consequential damages
            whatsoever (including, but not limited to, damages for loss of
            profits, loss of data or other information, for business
            interruption, for personal injury, loss of privacy arising out of or
            in any way related to the use of or inability to use the Service,
            third-party software and/or third-party hardware used with the
            Service, or otherwise in connection with any provision of this
            Terms), even if the Company or any supplier has been advised of the
            possibility of such damages and even if the remedy fails of its
            essential purpose. Some states do not allow the exclusion of implied
            warranties or limitation of liability for incidental or
            consequential damages, which means that some of the above
            limitations may not apply. In these states, each party's liability
            will be limited to the greatest extent permitted by law.
          </p>
        </section>
        {/* Section: "AS IS" and "AS AVAILABLE" Disclaimer */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            "AS IS" and "AS AVAILABLE" Disclaimer
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            The Service is provided to You "AS IS" and "AS AVAILABLE" and with
            all faults and defects without warranty of any kind. To the maximum
            extent permitted under applicable law, the Company, on its own
            behalf and on behalf of its Affiliates and its and their respective
            licensors and service providers, expressly disclaims all warranties,
            whether express, implied, statutory or otherwise, with respect to
            the Service, including all implied warranties of merchantability,
            fitness for a particular purpose, title and non-infringement, and
            warranties that may arise out of course of dealing, course of
            performance, usage or trade practice. Without limitation to the
            foregoing, the Company provides no warranty or undertaking, and
            makes no representation of any kind that the Service will meet Your
            requirements, achieve any intended results, be compatible or work
            with any other software, applications, systems or services, operate
            without interruption, meet any performance or reliability standards
            or be error free or that any errors or defects can or will be
            corrected. Without limiting the foregoing, neither the Company nor
            any of the company's provider makes any representation or warranty
            of any kind, express or implied: (i) as to the operation or
            availability of the Service, or the information, content, and
            materials or products included thereon; (ii) that the Service will
            be uninterrupted or error-free; (iii) as to the accuracy,
            reliability, or currency of any information or content provided
            through the Service; or (iv) that the Service, its servers, the
            content, or e-mails sent from or on behalf of the Company are free
            of viruses, scripts, trojan horses, worms, malware, timebombs or
            other harmful components. Some jurisdictions do not allow the
            exclusion of certain types of warranties or limitations on
            applicable statutory rights of a consumer, so some or all of the
            above exclusions and limitations may not apply to You. But in such a
            case the exclusions and limitations set forth in this section shall
            be applied to the greatest extent enforceable under applicable law.
          </p>
        </section>
        {/* Section: Governing Law */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Governing Law
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            The laws of the Country, excluding its conflicts of law rules, shall
            govern this Terms and Your use of the Service. Your use of the
            Application may also be subject to other local, state, national, or
            international laws.
          </p>
        </section>
        {/* Section: Disputes Resolution */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Disputes Resolution
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            If You have any concern or dispute about the Service, You agree to
            first try to resolve the dispute informally by contacting the
            Company.
          </p>
        </section>
        {/* Section: For European Union (EU) Users */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            For European Union (EU) Users
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            If You are a European Union consumer, you will benefit from any
            mandatory provisions of the law of the country in which you are
            resident in.
          </p>
        </section>
        {/* Section: United States Legal Compliance */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            United States Legal Compliance
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            You represent and warrant that (i) You are not located in a country
            that is subject to the United States government embargo, or that has
            been designated by the United States government as a "terrorist
            supporting" country, and (ii) You are not listed on any United
            States government list of prohibited or restricted parties.
          </p>
        </section>
        {/* Section: Severability and Waiver */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Severability and Waiver
          </h2>
          <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-200">
            Severability
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            If any provision of these Terms is held to be unenforceable or
            invalid, such provision will be changed and interpreted to
            accomplish the objectives of such provision to the greatest extent
            possible under applicable law and the remaining provisions will
            continue in full force and effect.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-200">
            Waiver
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            Except as provided herein, the failure to exercise a right or to
            require performance of an obligation under these Terms shall not
            effect a party's ability to exercise such right or require such
            performance at any time thereafter nor shall the waiver of a breach
            constitute a waiver of any subsequent breach.
          </p>
        </section>
        {/* Section: Translation Interpretation */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Translation Interpretation
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            These Terms and Conditions may have been translated if We have made
            them available to You on our Service. You agree that the original
            English text shall prevail in the case of a dispute.
          </p>
        </section>
        {/* Section: Changes to These Terms and Conditions */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Changes to These Terms and Conditions
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            We reserve the right, at Our sole discretion, to modify or replace
            these Terms at any time. If a revision is material We will make
            reasonable efforts to provide at least 30 days' notice prior to any
            new terms taking effect. What constitutes a material change will be
            determined at Our sole discretion. By continuing to access or use
            Our Service after those revisions become effective, You agree to be
            bound by the revised terms. If You do not agree to the new terms, in
            whole or in part, please stop using the website and the Service.
          </p>
        </section>
        {/* Section: Contact Us */}
        <section>
          <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-800 dark:text-slate-100">
            Contact Us
          </h2>
          <p className="mb-3 text-slate-600 dark:text-slate-300">
            If you have any questions about these Terms and Conditions, You can
            contact us:
          </p>
          <ul className="list-none mb-4 space-y-2 text-slate-600 dark:text-slate-300">
            {" "}
            {/* Changed to list-none for custom styling */}
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email:{" "}
              <a
                href="mailto:info@vinelms.com"
                className="ml-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                info@vinelms.com
              </a>
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Mail:{" "}
              <span className="ml-1">8 The Green STE B Dover, DE 19901</span>
            </li>
          </ul>
        </section>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400">
          Sincerely,
          <br />
          The Vine LMS Team
        </div>
      </div>
    </div>
  );
}
