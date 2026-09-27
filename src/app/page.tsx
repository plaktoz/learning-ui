import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-3xl font-semibold text-foreground">Notes</h1>
      <p className="max-w-sm text-base text-muted-foreground">
        A fast, quiet place to capture and organize notes.
      </p>
      <Button>Get started</Button>
    </div>
  );
}
