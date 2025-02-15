import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const meta: MetaFunction = () => {
  return [
    { title: "QuantumScribe - AI-Powered Agile Project Management" },
    { name: "description", content: "Streamline your agile workflow with AI-generated artifacts and real-time collaboration." },
  ];
};

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" to="/">
              <span className="font-bold">QuantumScribe</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              AI-Powered Agile Project Management
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Streamline your agile workflow with AI-generated artifacts and real-time collaboration.
              Transform ideas into structured projects effortlessly.
            </p>
            <div className="space-x-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">AI-Generated Artifacts</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate projects, epics, and user stories with AI assistance.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Real-time Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together seamlessly with your team in real-time.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Dynamic Kanban Board</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize and manage your workflow with an intuitive Kanban interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Remix and Supabase. Powered by AI.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-muted-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}