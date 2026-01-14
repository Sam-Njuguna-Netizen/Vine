"use client";

import { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

const faqs = [
  {
    question: "How do I sign up for an online course or subscription?",
    answer:
      "Signing up is easy! Simply visit settings and click on subscription. Choose your desired course or subscription, and click the \"Sign Up\" button. You'll be guided through a quick registration process where you'll enter payment details for automatic access. Monthly and yearly subscriptions are available options.",
  },
  {
    question: "Can I access the courses on multiple devices?",
    answer:
      "Yes! Our online courses and subscriptions are designed for flexibility. You can access your content on any device including apps from Apple and Google stores. This allows you to learn whenever and wherever it’s convenient for you.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept a variety of payment methods to make your purchase as convenient as possible. All transactions are processed securely to protect your information.",
  },
  {
    question: "Is there a free trial available for subscriptions?",
    answer:
      "No, not at this time. But please look out for future opportunities for free trials and discounts.",
  },
  {
    question:
      "How can I connect with other learners or users in the community?",
    answer:
      "We offer several ways to connect with fellow learners and build your network. You can join our social media platform, groups, participate in community features, and engage in other networking opportunities.",
  },
  {
    question:
      "What kind of support is available if I have questions or issues?",
    answer:
      "We’re here to help! Our support team is available at support@globalvine.org. Additionally, we ensure you have a smooth and enjoyable experience with our platform.",
  },
  {
    question:
      "Are there any discounts available for institution subscriptions?",
    answer:
      "No, not at this time. Please contact support@globalvine.org to learn more about our institutional subscription options and pricing.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl dark:text-gray-400 mx-auto sm:px-4 px-0 py-10 space-y-6">
      <p className="text-3xl font-bold text-center mb-10">
        Frequently Asked Questions
      </p>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className=" bg-none rounded-xl p-5 transition-all duration-200 shadow-sm "
        >
          <button
            className="w-full text-left flex justify-between items-center font-medium text-lg"
            onClick={() => toggleFAQ(index)}
          >
            <span>{faq.question}</span>
            {openIndex === index ? (
              <UpOutlined className="ml-3" />
            ) : (
              <DownOutlined className="ml-3" />
            )}
          </button>
          {openIndex === index && (
            <div className="mt-4 text-base leading-relaxed">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
