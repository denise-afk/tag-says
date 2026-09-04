import Link from "next/link";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const isSuccess = searchParams.status === "success";

  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-20 text-center max-w-[60ch] mx-auto">
      <h1 className="font-display font-black uppercase text-3xl sm:text-4xl">
        {isSuccess ? "Order received." : "Checkout"}
      </h1>
      <p className="mt-4 text-muted">
        {isSuccess
          ? "This confirmation page renders once Stripe is connected and a real payment succeeds."
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
