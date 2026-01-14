"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripeCheckout from "@/app/Components/StripeCheckoutSubscription";
import { toast } from "sonner";

export default function CheckoutModalSubscription({
  open,
  onCancel,
  plan,
  onSuccess,
}) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <StripeCheckout
            plan={plan}
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onCancel();
              toast.success("Payment successful! Thank you for your purchase.");
            }}
            onError={(error) => {
              toast.error(error || "Payment failed. Please try again.");
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}