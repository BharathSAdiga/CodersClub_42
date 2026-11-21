import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollReveal } from '@/components/interactive/ScrollReveal';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      toast.error('Please enter your name and mobile number.');
      return;
    }
    setSubmitted(true);
    toast.success('Your query has been logged with our regional grievance team.');
  };

  return (
    <section className="my-20 max-w-5xl mx-auto">
      <ScrollReveal direction="up" duration={0.6}>
        <div className="rounded-3xl bg-white border border-brand-forest/15 p-8 sm:p-12 shadow-card hover:shadow-elevated transition-shadow duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Info */}
            <ScrollReveal direction="right" delay={0.1} duration={0.6}>
              <div>
                <Badge variant="forest">Get in Touch</Badge>
                <h2 className="text-3xl font-display font-bold text-brand-charcoal tracking-tight mt-2">
                  Regional Support & Grievance Redressal
                </h2>
                <p className="text-xs sm:text-sm text-brand-charcoal/70 mt-2 leading-relaxed">
                  Have questions about your application or need vernacular assistance in Hindi, Tamil, Kannada, or Marathi? Our team is available 6 days a week.
                </p>

                <div className="space-y-4 mt-8 text-xs sm:text-sm text-brand-charcoal/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>Toll-Free MSME Desk: 1800-425-9000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>nodal.officer@udyoga.fin.in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Fintech Hub, BKC, Mumbai / Bengaluru Tech Park</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-forest/10 text-xs text-brand-charcoal/60">
                  <span>Operating hours: Mon – Sat, 9:00 AM – 7:00 PM IST.</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Contact Form */}
            <ScrollReveal direction="left" delay={0.2} duration={0.6}>
              <div>
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-brand-forest/5 rounded-2xl border border-brand-forest/20">
                    <div className="w-12 h-12 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-brand-charcoal">
                      Inquiry Dispatched
                    </h3>
                    <p className="text-xs text-brand-charcoal/70 mt-1 max-w-xs">
                      A regional nodal support representative will contact you on <strong className="text-brand-charcoal">{mobile}</strong> within 2 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                        Merchant / Enterprise Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Ramesh Kumar (Sri Balaji Provisions)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-xs bg-brand-ivory/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                        Mobile Number (OTP linked)
                      </label>
                      <Input
                        type="tel"
                        placeholder="+91 98450 XXXXX"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="text-xs bg-brand-ivory/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-brand-charcoal block mb-1">
                        Assistance Category / Query
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Inquiring about connecting my PhonePe merchant QR for working capital..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-md border border-brand-charcoal/20 bg-brand-ivory/50 p-2.5 text-xs text-brand-charcoal placeholder:text-brand-charcoal/40 focus:outline-none focus:ring-1 focus:ring-brand-forest"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full bg-brand-forest text-white hover:bg-brand-forest/90 text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Connect with Regional Nodal Desk</span>
                    </Button>
                  </form>
                )}
              </div>
            </ScrollReveal>

          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
