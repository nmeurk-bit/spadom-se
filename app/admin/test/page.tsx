'use client';

export default function TestPage() {
  console.log('TEST PAGE LOADED!');

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-4">
        Test Page - Om du ser detta fungerar routing!
      </h1>
      <p className="text-gray-300">
        Öppna console (F12) och du borde se "TEST PAGE LOADED!"
      </p>
    </div>
  );
}
