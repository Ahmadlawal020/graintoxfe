import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="h-[100dvh] flex w-full bg-background overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 relative overflow-y-auto bg-muted/30">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
