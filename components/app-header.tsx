"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Brain, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createBrowserClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import type { Session } from "@supabase/supabase-js"

interface AppHeaderProps {
  variant?: "default" | "minimal"
  user?: { id: string; email?: string; user_type?: string } | null
}

export function AppHeader({ variant = "default", user: initialUser }: AppHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string; user_type?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", authUser.id).single()

        setUser({
          id: authUser.id,
          email: authUser.email,
          user_type: profile?.user_type,
        })
      }
      setIsLoading(false)
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      if (session?.user) {
        fetchUser()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

    const showNavLinks = !user || user.user_type !== "counsellor"
  
      const navLinks = user
        ? [
                { href: "/dashboard", label: "Dashboard" },
                { href: "https://frontend-9pry.vercel.app/", label: "Chat", external: true },

            { href: "/counsellors", label: "Counsellors" },
            { href: "/contact", label: "Contact" },
          ]
        : [
            { href: "/#features", label: "Features" },
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/counsellors", label: "Counsellors" },
            { href: "/contact", label: "Contact" },
          ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-lg border-b shadow-sm" : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
            {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  SukoonAI
                </span>
              </Link>


            {showNavLinks && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return isExternal ? (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" className="hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                        {link.label}
                      </Button>
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href}>
                      <Button variant="ghost" className="hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

            {!isLoading && (
              <>
                {user ? (
                  <>
                    {user.user_type === "counsellor" ? (
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex gap-2 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <Link href="/dashboard">
                        <Button size="sm" className="hidden md:flex hover:scale-105 transition-transform duration-300">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button size="sm" className="hover:scale-105 transition-transform duration-300">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80%] sm:w-87.5">
                  <div className="flex flex-col gap-4 mt-8">
                    {showNavLinks &&
                      navLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  {user ? (
                    <>
                      <div className="border-t my-2" />
                      <Button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        variant="outline"
                        className="w-full bg-transparent gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="border-t my-2" />
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-transparent">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
