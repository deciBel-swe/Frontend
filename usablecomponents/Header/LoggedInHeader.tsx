export default function LoggedInHeader() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-50">
      <div className="font-bold text-xl">SOUNDCLOUD</div>

      <nav className="flex gap-6 text-sm">
        <a href="/feed">Home</a>
        <a href="/library">Library</a>
        <a href="/upload">Upload</a>
      </nav>
    </header>
  );
}