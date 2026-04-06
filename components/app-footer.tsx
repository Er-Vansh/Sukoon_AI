import Link from "next/link"
import { Brain, Mail, Phone, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">SukoonAI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional mental health support combining AI technology with licensed counsellors for comprehensive
              care.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
                {[
                  { href: "/#features", label: "Features" },
                  { href: "/#how-it-works", label: "How It Works" },
                  { href: "/counsellors", label: "Find Counsellors" },
                  { href: "https://frontend-9pry.vercel.app/", label: "AI Therapy" },
                ].map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              {[
                { href: "/help", label: "Help Center" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for mental health tips and updates.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" type="email" className="flex-1" />
              <Button size="sm">Subscribe</Button>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 mt-0.5 shrink-0" />
                <span>support@SukoonAI.com</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 mt-0.5 shrink-0" />
                <span>1-800-Sukoon-AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              {currentYear} SukoonAI. All rights reserved. Building a healthier world together.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="hover:text-primary transition-colors">
                Sitemap
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
