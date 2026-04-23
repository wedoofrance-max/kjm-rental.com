import { ToastContainer } from '../../components/ui/Toast';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
