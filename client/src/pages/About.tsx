import { Mail, Phone, MapPin, Instagram } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-3_c4b79e22.jpg";
const STORY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663535558553/KyKey2VrFEZNwKpbpdN6tN/candle-5_a297d52f.jpg";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="About OmaLuxe" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[oklch(0.10_0.015_55/0.6)]" />
        </div>
        <div className="relative container pb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.72_0.12_75)] mb-2">Our Story</p>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-white">About OmaLuxe</h1>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-4">The Beginning</p>
              <h2 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] mb-6 leading-tight">
                Born from a passion for<br />
                <em className="font-medium">refined living</em>
              </h2>
              <div className="space-y-4 font-sans text-sm text-[oklch(0.38_0.04_60)] leading-relaxed">
                <p>
                  OmaLuxe Candles and Scents was founded with a singular vision: to create candles that are not merely decorative objects, but transformative experiences. Each fragrance is a carefully composed story — a journey to a place, a feeling, a memory.
                </p>
                <p>
                  We source only the finest natural ingredients — pure soy and coconut wax, rare fragrance oils from the world's most celebrated perfumers, and lead-free cotton wicks. Every candle is hand-poured in small batches to ensure uncompromising quality.
                </p>
                <p>
                  From the warmth of Velvet Rose & Oud to the serene calm of Himalayan Mist, our collection is designed to speak to every mood, every moment, every space. We believe that luxury is not an indulgence — it is a way of honouring the everyday.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={STORY_IMAGE}
                alt="Our story"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-[oklch(0.72_0.12_75)] p-6 max-w-[200px]">
                <p className="font-serif text-3xl font-semibold text-white">9+</p>
                <p className="font-sans text-xs text-white/80 tracking-wide mt-1">Signature Fragrances</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[oklch(0.96_0.012_80)]">
        <div className="container">
          <div className="text-center mb-14">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-3">What We Stand For</p>
            <h2 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)]">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Purity",
                desc: "We use only natural, non-toxic ingredients. No synthetic dyes, no paraffin, no compromise.",
              },
              {
                number: "02",
                title: "Craftsmanship",
                desc: "Every candle is hand-poured in small batches, inspected individually, and finished with care.",
              },
              {
                number: "03",
                title: "Sustainability",
                desc: "Our packaging is recyclable, our waxes are sustainably sourced, and our commitment to the planet is unwavering.",
              },
            ].map((val) => (
              <div key={val.number} className="bg-white p-8 border border-[oklch(0.88_0.015_75)]">
                <p className="font-serif text-5xl font-light text-[oklch(0.72_0.12_75/0.3)] mb-4">{val.number}</p>
                <h3 className="font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)] mb-3">{val.title}</h3>
                <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact info */}
            <div>
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[oklch(0.62_0.12_70)] mb-4">Get In Touch</p>
              <h2 className="font-serif text-4xl font-light text-[oklch(0.18_0.015_60)] mb-6">
                We'd love to<br />
                <em className="font-medium">hear from you</em>
              </h2>
              <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] leading-relaxed mb-10">
                Whether you have a question about our products, need help choosing the perfect scent, or want to discuss a bespoke order — we're here for you.
              </p>
              <div className="space-y-5">
                {[
                  { icon: <Mail size={18} strokeWidth={1.5} />, label: "Email", value: "hello@omaluxe.com" },
                  { icon: <Phone size={18} strokeWidth={1.5} />, label: "Phone", value: "+254790876812" },
                  { icon: <MapPin size={18} strokeWidth={1.5} />, label: "Location", value: "Available worldwide — we ship globally" },
                  { icon: <Instagram size={18} strokeWidth={1.5} />, label: "Instagram", value: "@omaluxecandles" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.72_0.12_75/0.1)] flex items-center justify-center text-[oklch(0.62_0.12_70)] shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.62_0.12_70)] mb-0.5">{item.label}</p>
                      <p className="font-sans text-sm text-[oklch(0.38_0.04_60)]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-[oklch(0.96_0.012_80)] p-8 border border-[oklch(0.88_0.015_75)]">
              <h3 className="font-serif text-2xl font-medium text-[oklch(0.18_0.015_60)] mb-6">Send a Message</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for your message! We'll be in touch shortly.");
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-[oklch(0.88_0.015_75)] px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-[oklch(0.88_0.015_75)] px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white border border-[oklch(0.88_0.015_75)] px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors"
                  />
                </div>
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[oklch(0.52_0.02_60)] block mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-white border border-[oklch(0.88_0.015_75)] px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] focus:outline-none focus:border-[oklch(0.62_0.12_70)] transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="btn-luxury w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
