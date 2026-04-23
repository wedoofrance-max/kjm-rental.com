export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-6 text-gradient">KJM Motors</h1>
        <p className="text-2xl font-medium mb-8 text-neutral-700">
          Scooter Rental Platform
        </p>
        <p className="text-lg text-neutral-600 mb-12">
          Welcome to the KJM Motors development environment. The foundation is set up and ready for Phase 2 implementation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">✓ Database</h3>
            <p className="text-neutral-600">SQLite configured & ready</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">✓ Design System</h3>
            <p className="text-neutral-600">Tailwind + CSS tokens</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">✓ State Management</h3>
            <p className="text-neutral-600">Zustand stores ready</p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-primary rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Phase 1 Complete ✓</h2>
          <p className="mb-6">Project initialization and foundational setup is complete.</p>
          <p className="text-sm opacity-90">
            Next: Phase 2 - Design System & Base Components
          </p>
        </div>
      </div>
    </div>
  );
}
