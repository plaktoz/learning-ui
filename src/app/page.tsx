import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <H1>Notes</H1>
          <Muted>A fast, quiet place to capture and organize notes.</Muted>
          <div>
            <Button>Get started</Button>
          </div>
        </div>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Design system check</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Muted>Sample note preview card.</Muted>
            <div className="flex gap-1.5">
              <Badge>ideas</Badge>
              <Badge variant="secondary">work</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
