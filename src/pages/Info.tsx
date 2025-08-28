import HeroBanner from "@/components/HeroBanner";

const Info = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">Info</h1>
        {/* Content will be added later */}
      </main>
    </div>
  );
};

export default Info;