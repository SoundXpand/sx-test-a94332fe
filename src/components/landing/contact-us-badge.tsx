import { Mail } from "lucide-react";

interface ContactUsBadgeProps {
  email?: string;
  text?: string;
}

/**
 * Fixed left-side rotating "Contact us" badge.
 * Reusable across all landing pages. Opens user's mail client on click.
 */
export function ContactUsBadge({
  email = "hello@soundxpand.com",
  text = "CONTACT US • EMAIL US • GET IN TOUCH • ",
}: ContactUsBadgeProps) {
  const rotating = text.repeat(2);
  return (
    <a
      href={`mailto:${email}`}
      aria-label={`Contact us at ${email}`}
      className="group fixed bottom-6 left-4 z-40 sm:left-6"
    >
      <div className="relative grid h-20 w-20 place-items-center sm:h-24 sm:w-24">
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite] text-foreground"
          aria-hidden
        >
          <defs>
            <path
              id="contact-rot-circle"
              d="M 100,100 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
            />
          </defs>
          <text
            className="fill-current"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              letterSpacing: "0.2em",
              fontWeight: 600,
            }}
          >
            <textPath href="#contact-rot-circle" startOffset="0">
              {rotating}
            </textPath>
          </text>
        </svg>
        <div className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white shadow-[0_0_30px_-4px_var(--brand-violet-deep)] transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
          <Mail className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}
