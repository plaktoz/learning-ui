import * as React from "react";
import { cn } from "cn";

function H1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-3xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function Text({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-base text-foreground", className)} {...props} />
  );
}

function Small({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-foreground", className)} {...props} />
  );
}

function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { H1, H2, H3, Text, Small, Muted };
