import Header from "@/components/Header";
import SpaceNews from "@/components/SpaceNews";

export default function MissionsPage() {
  return (
    <main className="relative min-h-screen bg-transparent z-10">
      <Header />
      <div className="pt-24">
        <SpaceNews />
      </div>
    </main>
  );
}
