export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Business Manager</h1>
        <p className="text-xl mb-8">Manage quotes, invoices, jobs and customers</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="bg-white text-green-600 px-8 py-3 rounded font-bold hover:bg-gray-100 transition"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="border-2 border-white text-white px-8 py-3 rounded font-bold hover:bg-white hover:text-green-600 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
