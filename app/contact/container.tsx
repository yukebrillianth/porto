'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';

import { Footer, Navbar } from '@/components/layouts';
import {
  Button,
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import { email, socials } from '@/constants';
import { getErrorMessage, getValidationErrors } from '@/lib/http-error';
import { contactSchema, type ContactRequest } from '@/schemas/contact';

const fieldClasses =
  'focus-visible:ring-primary w-full rounded-[12px] border border-white/15 bg-surface px-[20px] py-3.5 text-base font-medium text-white placeholder:text-white/35 focus-visible:ring-2 focus-visible:outline-none';

export default function ContactContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactRequest>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactRequest) => {
    setIsLoading(true);
    setGlobalError('');

    try {
      // ---------------------------------------------------------------------
      // TODO: there is no backend for this form yet.
      //
      // Until a mail route exists (e.g. app/api/contact/route.ts + Resend),
      // this hands the message off to the visitor's own mail client so nothing
      // is silently dropped. Replace this block with a real POST when the
      // endpoint lands - the catch below is already shaped for it.
      // ---------------------------------------------------------------------
      const subject = `Portfolio contact - ${data.name}`;
      const body = `${data.message}\n\n-\n${data.name}\n${data.email}`;
      const mailto = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      toast.success('Opening your mail app to send the message.');
      reset();
    } catch (error) {
      const msg = getErrorMessage(error);
      setGlobalError(msg);
      toast.error(msg);

      const validationErrors = getValidationErrors(error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field as keyof ContactRequest, {
            type: 'server',
            message,
          });
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Section tone="dark">
        <Navbar />

        <GlowOrb className="bottom-0 left-[15%]" />

        <SectionInner>
          <Eyebrow>CONTACT</Eyebrow>

          <div className="content-indent mt-4">
            <SectionTitle className="text-white">Let&apos;s Talk.</SectionTitle>

            <p className="text-muted-dark mt-6 max-w-[41rem] text-[18px] leading-[24px]">
              I&apos;m always happy to talk about robotics, software systems,
              distributed systems, AI and product engineering - whether
              that&apos;s a project you&apos;re building, a problem that
              won&apos;t behave, or a team looking for an engineer who works
              across the stack. Send me a message and I&apos;ll get back to you.
            </p>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {socials.map((social) => (
                <div
                  key={social.platform}
                  className="bg-surface relative flex items-center gap-4 rounded-[12px] px-7 py-5"
                >
                  <Image
                    src={social.icon}
                    alt=""
                    aria-hidden="true"
                    width={16}
                    height={17}
                    className="h-[17px] w-[16px] shrink-0 brightness-0 invert"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {social.platform}
                    </p>
                    <p className="text-muted-dark text-sm font-medium">
                      {social.username}
                    </p>
                  </div>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-visible:ring-primary rounded-[12px] transition after:absolute after:inset-0 hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="sr-only">
                      {social.platform} - {social.username}
                    </span>
                  </a>
                </div>
              ))}

              <div className="bg-surface relative flex items-center gap-4 rounded-[12px] px-7 py-5">
                <div>
                  <p className="text-base font-semibold text-white">Email</p>
                  <p className="text-muted-dark text-sm font-medium">{email}</p>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="focus-visible:ring-primary rounded-[12px] transition after:absolute after:inset-0 hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="sr-only">Email {email}</span>
                </a>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-16 flex max-w-xl flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className={fieldClasses}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={fieldClasses}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="What are you building?"
                  className={fieldClasses}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {globalError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
                  <p className="text-sm font-medium text-red-500">
                    {globalError}
                  </p>
                </div>
              )}

              <div className="mt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending…' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </SectionInner>
      </Section>

      <Footer />
    </>
  );
}
