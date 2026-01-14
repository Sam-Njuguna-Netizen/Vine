"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StripeCheckout from "@/app/Components/StripeCheckout";
import { toast } from "sonner";

export default function CheckoutModal({
  open,
  onCancel,
  cartList,
}) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {cartList?.length > 1 ? "Checkout All Items" : "Complete Your Purchase"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <StripeCheckout
            cartList={cartList}
            onSuccess={() => {
              onCancel();
              toast.success("Payment successful! Thank you for your purchase.");
            }}
            onError={(error) => {
              toast.error(error?.message || "Payment failed. Please try again.");
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}