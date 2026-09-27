"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "cn";

function Accordion({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion"
      className={cn("rounded-xl border border-border bg-card/50", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="accordion-item" className={cn("", className)} {...props} />;
}

function AccordionTrigger({
  className,
  children,
  open,
  onToggle,
}: {
  className?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium transition hover:bg-muted/50",
        className,
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

function AccordionContent({
  className,
  children,
  open,
}: {
  className?: string;
  children: React.ReactNode;
  open: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className={cn("border-t border-border px-4 py-3", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
