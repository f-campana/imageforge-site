import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="section-shell flex min-h-screen max-w-3xl flex-col justify-center py-24"
    >
      <p className="font-mono text-sm text-emerald-300">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-zinc-400">
        The page may have moved. Continue with the ImageForge documentation or
        return to the project overview.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/docs"
          className="ui-focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          Browse documentation
        </Link>
        <Link
          href="/"
          className="ui-focus-ring rounded-lg border border-white/15 px-5 py-3 font-semibold text-zinc-200 hover:border-white/30 hover:text-white"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
