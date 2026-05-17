import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                <Shield className="size-4" />
              </div>
              <span className="font-semibold">SecureVote</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Enterprise-grade online election infrastructure with anonymous voting,
              audit trails, and real-time transparency.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/elections" className="hover:text-foreground">Browse elections</Link></li>
              <li><Link to="/apply" className="hover:text-foreground">Become a creator</Link></li>
              <li><a href="/#security" className="hover:text-foreground">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
              <li><a href="#" className="hover:text-foreground">Audit policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SecureVote. All rights reserved.</p>
          <p>Built for secure, transparent democratic processes.</p>
        </div>
      </div>
    </footer>
  )
}
