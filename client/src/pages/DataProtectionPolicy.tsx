import { useEffect } from "react";

const sections = [
  {
    title: "Information we collect",
    body: "We may collect information you provide when you create an account, place an order, contact us, or subscribe to updates. This can include your name, email address, phone number, shipping details, order details, and account information.",
  },
  {
    title: "How we use your information",
    body: "We use information to provide and improve our store, process and deliver orders, manage accounts and wishlists, respond to enquiries, send service messages, prevent misuse, and meet legal or accounting obligations.",
  },
  {
    title: "Sharing and service providers",
    body: "We do not sell your personal information. We may share information with trusted providers that help us host the site, provide authentication, store data, deliver orders, send communications, or comply with a legal request. Providers may only use information as needed to provide their services.",
  },
  {
    title: "Storage and retention",
    body: "We retain personal information only for as long as reasonably necessary for the purposes described here, including order, security, accounting, and legal requirements. We apply reasonable safeguards, but no online service can guarantee absolute security.",
  },
  {
    title: "Your choices and rights",
    body: "You may request access to, correction of, or deletion of personal information we hold about you, subject to applicable law. You may also unsubscribe from promotional messages at any time. To make a request, contact us using the address below.",
  },
  {
    title: "Cookies and similar technologies",
    body: "The site may use essential cookies or local storage to support authentication, shopping, preferences, and security. Some service providers may use similar technologies to operate or measure their services.",
  },
  {
    title: "Children's privacy",
    body: "Our store is not directed to children, and we do not knowingly collect personal information from children without appropriate permission.",
  },
  {
    title: "Policy updates and contact",
    body: "We may update this policy as our services or legal obligations change. The latest version will be posted on this page. For privacy questions or requests, email omaluxescentskenya@gmail.com.",
  },
];

export default function DataProtectionPolicy() {
  useEffect(() => {
    document.title = "Data Protection Policy | OmaLuxe";
  }, []);

  return (
    <main className="min-h-screen bg-[oklch(0.88_0.025_66/0.84)] pt-28 pb-16">
      <div className="container max-w-4xl">
        <header className="mb-10 border-b border-[oklch(0.88_0.015_75)] pb-8">
          <p className="mb-3 font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)]">
            OmaLuxe Candles and Scents
          </p>
          <h1 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] md:text-5xl">
            Data Protection Policy
          </h1>
          <p className="mt-4 font-sans text-sm text-[oklch(0.52_0.02_60)]">
            Last updated: November 4, 2026
          </p>
        </header>

        <div className="border border-[oklch(0.88_0.015_75)] bg-white p-6 sm:p-10">
          <p className="mb-8 font-sans text-sm leading-relaxed text-[oklch(0.38_0.04_60)]">
            This policy explains how OmaLuxe handles personal information when
            you visit our website, create an account, or shop with us. It is
            intended as general information and does not replace rights or
            obligations provided by applicable data protection law.
          </p>
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-2 font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)]">
                  {section.title}
                </h2>
                <p className="font-sans text-sm leading-relaxed text-[oklch(0.52_0.02_60)]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
