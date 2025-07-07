import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Zap, Percent } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl font-semibold font-headline text-primary">OxyTrack</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Production
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250 m³</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Purity Level
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.5%</div>
              <p className="text-xs text-muted-foreground">
                Within optimal range
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center">
            <h2 className="text-xl font-semibold">Production Log</h2>
            <Button size="sm" className="ml-auto gap-1">
                <PlusCircle className="h-4 w-4" />
                New Entry
            </Button>
        </div>
        <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-muted-foreground">No production data recorded yet.</p>
                    <p className="text-sm text-muted-foreground">Click 'New Entry' to start logging.</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
