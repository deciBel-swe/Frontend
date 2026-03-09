/**
 * Home Page
 * 
 * Landing page for the DeciBel application.
 * This is a placeholder that will be replaced with actual content.
 */

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
     <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">
        DeciBel
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Social Streaming Platform
      </p> 
      <button className="bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand">
        Test Button
      </button>
      <div className="bg-surface-default border border-border-default text-text-primary">
       <p className="text-text-muted text-sm">2.4K plays</p>
      </div>
       <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
       <span className="text-status-success">Upload complete</span>
      </div>
    </main>
  );
}
