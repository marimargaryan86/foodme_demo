import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foodmeApi } from "@/api/foodme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StarInput } from "@/components/sections/star-rating";

const MAX_COMMENT = 1000;

interface RateOrderDialogProps {
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RateOrderDialog({ orderNumber, open, onOpenChange }: RateOrderDialogProps) {
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () => foodmeApi.rateOrder(orderNumber, { stars, comment: comment.trim() || undefined }),
    onSuccess: async () => {
      // the order list/tracking now show the stars, and the chef's average changed
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderNumber] }),
        queryClient.invalidateQueries({ queryKey: ["chef"] }),
        queryClient.invalidateQueries({ queryKey: ["chefs"] }),
      ]);
      onOpenChange(false);
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStars(0);
      setComment("");
      mutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <form
          aria-label="Rate order"
          className="flex flex-col gap-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (stars >= 1) mutation.mutate();
          }}
        >
          <div className="pr-8">
            <DialogTitle className="font-display text-xl font-bold text-zinc-900">Rate your order</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-zinc-500">
              Order {orderNumber}. How was it?
            </DialogDescription>
          </div>

          <StarInput value={stars} onChange={setStars} label="Your rating" />

          <div>
            <label htmlFor="rating-comment" className="sr-only">
              Comment (optional)
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              maxLength={MAX_COMMENT}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us about your order"
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-zinc-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-100"
            />
            <p className="mt-1 text-right text-xs tabular-nums text-zinc-400">
              {comment.length}/{MAX_COMMENT}
            </p>
          </div>

          {mutation.isError && (
            <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mutation.error instanceof Error ? mutation.error.message : "Couldn’t save your rating."}
            </p>
          )}

          <Button type="submit" size="lg" disabled={stars < 1 || mutation.isPending} className="w-full">
            {mutation.isPending ? "Submitting…" : "Submit rating"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
