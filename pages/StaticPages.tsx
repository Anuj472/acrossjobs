
import React from 'react';

export const AboutUs: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">About AcrossJob</h1>
    <div className="prose prose-slate max-w-none">
      <p className="text-lg text-slate-600 mb-6">
        AcrossJob was founded with a single mission: to bridge the gap between world-class talent and high-growth companies using the power of networking.
      </p>
      <p className="text-slate-600 mb-6">
        We believe that the traditional application process is broken. Resume filters and "black holes" prevent talented individuals from getting the attention they deserve. AcrossJob empowers candidates by providing the tools to find referrals and connect directly with hiring teams.
      </p>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
      <p className="text-slate-600 mb-6">
        To create a more transparent, efficient, and human job market where opportunities are accessible based on merit and connection, not just algorithm scores.
      </p>
    </div>
  </div>
);

export const Contact: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 text-center">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Get in Touch</h1>
    <p className="text-xl text-slate-600 mb-12">
      Have questions or feedback? We'd love to hear from you.
    </p>
    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm inline-block">
      <h2 className="text-2xl font-bold text-indigo-600 mb-2">Email Us</h2>
      <a href="mailto:team@acrossjob.com" className="text-3xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
        team@acrossjob.com
      </a>
      <p className="text-slate-500 mt-6">
        Our support team typically responds within 24-48 hours.
      </p>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
    <div className="prose prose-slate max-w-none text-slate-600">
      <p className="mb-4">Last updated: January 2026</p>
      <p className="mb-6">At AcrossJob, we take your privacy seriously. This policy describes how we collect, use, and handle your data when you use our services.</p>
      <h2 className="text-xl font-bold text-slate-900 mb-2">1. Data Collection</h2>
      <p className="mb-6">We only collect data necessary to provide our job search services. This includes search queries and interaction data within the app.</p>
      <h2 className="text-xl font-bold text-slate-900 mb-2">2. Data Usage</h2>
      <p className="mb-6">Your data is used solely to improve the job discovery experience. We do not sell your personal information to third parties.</p>
    </div>
  </div>
);

export const TermsOfService: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>
    <div className="prose prose-slate max-w-none text-slate-600">
      <p className="mb-4">Effective date: January 1, 2026</p>
      <p className="mb-6">Welcome to AcrossJob. By using our website, you agree to comply with and be bound by the following terms.</p>
      <h2 className="text-xl font-bold text-slate-900 mb-2">1. Acceptable Use</h2>
      <p className="mb-6">You agree to use AcrossJob for legitimate job-seeking and professional networking purposes only.</p>
      <h2 className="text-xl font-bold text-slate-900 mb-2">2. Limitations</h2>
      <p className="mb-6">AcrossJob is an aggregator and facilitator. We are not responsible for the hiring decisions of the companies listed on our platform.</p>
    </div>
  </div>
);
