import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useBubbleBurst } from "@/hooks/useBubbleBurst";
import BubbleBurst from "@/components/common/BubbleBurst";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-full bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(259,94%,65%)] text-white shadow-[0_0_20px_hsl(217,91%,60%,0.4),0_0_40px_hsl(217,91%,60%,0.2),inset_0_1px_0_hsl(0,0%,100%,0.2)] hover:shadow-[0_0_30px_hsl(217,91%,60%,0.6),0_0_60px_hsl(217,91%,60%,0.3),inset_0_1px_0_hsl(0,0%,100%,0.3)] hover:scale-[1.02] active:scale-[0.98] border border-white/20 backdrop-blur-sm duration-300",
        destructive: "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "rounded-full border-2 border-[hsl(217,91%,60%)] bg-background/80 backdrop-blur-sm text-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,60%)]/10 hover:shadow-[0_0_20px_hsl(217,91%,60%,0.3)] transition-all duration-300",
        secondary: "rounded-full bg-gradient-to-r from-[hsl(259,94%,65%)] to-[hsl(217,91%,60%)] text-white shadow-[0_0_20px_hsl(259,94%,65%,0.4),0_0_40px_hsl(259,94%,65%,0.2),inset_0_1px_0_hsl(0,0%,100%,0.2)] hover:shadow-[0_0_30px_hsl(259,94%,65%,0.6),0_0_60px_hsl(259,94%,65%,0.3),inset_0_1px_0_hsl(0,0%,100%,0.3)] hover:scale-[1.02] active:scale-[0.98] border border-white/20 backdrop-blur-sm duration-300",
        ghost: "rounded-full hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "rounded-full bg-gradient-to-r from-[hsl(180,100%,65%)] to-[hsl(189,100%,60%)] text-white shadow-[0_0_20px_hsl(189,100%,60%,0.4),0_0_40px_hsl(189,100%,60%,0.2),inset_0_1px_0_hsl(0,0%,100%,0.2)] hover:shadow-[0_0_30px_hsl(189,100%,60%,0.6),0_0_60px_hsl(189,100%,60%,0.3),inset_0_1px_0_hsl(0,0%,100%,0.3)] hover:scale-[1.02] active:scale-[0.98] border border-white/20 backdrop-blur-sm duration-300",
        neon: "rounded-full bg-gradient-to-r from-[hsl(25,95%,70%)] to-[hsl(340,82%,65%)] text-white shadow-[0_0_20px_hsl(340,82%,65%,0.4),0_0_40px_hsl(340,82%,65%,0.2),inset_0_1px_0_hsl(0,0%,100%,0.2)] hover:shadow-[0_0_30px_hsl(340,82%,65%,0.6),0_0_60px_hsl(340,82%,65%,0.3),inset_0_1px_0_hsl(0,0%,100%,0.3)] hover:scale-[1.02] active:scale-[0.98] border border-white/20 backdrop-blur-sm duration-300",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-full px-4",
        lg: "h-13 rounded-full px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withBubbles?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withBubbles = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { origin, showBurst, burstBubbles, triggerBurst } = useBubbleBurst();
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withBubbles && buttonRef.current) {
        triggerBurst(buttonRef.current);
      }
      onClick?.(e);
    };

    React.useImperativeHandle(ref, () => buttonRef.current!);

    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={buttonRef}
          onClick={handleClick}
          {...props}
        />
        {withBubbles && <BubbleBurst show={showBurst} origin={origin} bubbles={burstBubbles} />}
      </>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
