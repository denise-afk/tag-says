import Link from "next/link";
import { PurchaseTracker } from "@/components/PurchaseTracker";
import { getPaidSessionSummary } from "@/lib/stripe";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { status?: string; session_id?: string };
}) {
  const isSuccess = searchParams.status === "success";
  const paid =
    isSuccess && searchParams.session_id
      ? await getPaidSessionSummary(searchParams.session_id)
      : null;

  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-20 text-center max-w-[60ch] mx-auto">
      {paid && (
        <PurchaseTracker
          sessionId={paid.id}
          totalCents={paid.totalCents}
          currency={paid.currency}
          itemCount={paid.itemCount}
        />
      )}
      <h1 className="font-display font-black uppercase text-3xl sm:text-4xl">
        {isSuccess ? "Order received." : "Checkout"}
      </h1>
      <p className="mt-4 text-muted">
        {isSuccess
          ? "Thanks for your order \u2014 your custom tag is on its way to print. You'll get a shipping update once it's on the road to you."
          : "Payment processing isn't connected yet. See lib/stripe.ts and the README for setup steps."}
      </p>
      <Link
        href="/"
        className="inline-block mt-8 px-7 py-3.5 border border-ink font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink hover:text-paper transition-colors"
      >
        Back Home
      </Link>
    </section>
  );
}
