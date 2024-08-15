export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}
