import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export default function PageShell({
  children,
  navScrolled = true,
}: {
  children: React.ReactNode;
  navScrolled?: boolean;
}) {
  return (
    <>
      <SiteNav scrolled={navScrolled} />
      <main className="content-page">{children}</main>
      <SiteFooter />
    </>
  );
}
