"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface EmailComposerProps {
  onSubmit?: (data: { name: string; email: string; body: string }) => void;
  defaultValues?: {
    name?: string;
    email?: string;
    body?: string;
  };
}

interface FormData {
  name: string;
  email: string;
  body: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  body?: string;
  submit?: string;
}

export function EmailComposer({
  onSubmit,
  defaultValues,
}: EmailComposerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    body: defaultValues?.body || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          body: formData.body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setIsSuccess(true);
      
      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          body: formData.body.trim(),
        });
      }

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          body: "",
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to send email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) {
              setErrors({ ...errors, name: undefined });
            }
          }}
          aria-invalid={!!errors.name}
          disabled={isSubmitting || isSuccess}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Work email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              setErrors({ ...errors, email: undefined });
            }
          }}
          aria-invalid={!!errors.email}
          disabled={isSubmitting || isSuccess}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Scope, timeline, or anything else"
          value={formData.body}
          onChange={(e) => {
            setFormData({ ...formData, body: e.target.value });
            if (errors.body) {
              setErrors({ ...errors, body: undefined });
            }
          }}
          aria-invalid={!!errors.body}
          disabled={isSubmitting || isSuccess}
          rows={4}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm text-destructive">{errors.submit}</p>
      )}

      {isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Email sent successfully! Thank you for reaching out.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isSuccess}
      >
        {isSubmitting ? (
          "Sending..."
        ) : isSuccess ? (
          "Sent!"
        ) : (
          <>
            Send a note
            <ArrowRight className="ml-2 size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
