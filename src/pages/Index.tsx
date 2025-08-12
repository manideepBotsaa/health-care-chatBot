import heroImage from "@/assets/hero-healthcare.jpg";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Button } from "@/components/ui/button";

const Index = () => {
  const scrollToChat = () => {
    const el = document.getElementById("chat-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Serene Care Bot",
    applicationCategory: "HealthApplication",
    description: "Minimalist healthcare chatbot for empathetic, accurate guidance.",
    url: "/",
  };

  return (
    <main>
      <header className="container max-w-5xl py-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 animate-enter">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Serene Care Bot – Minimalist Healthcare Chatbot</h1>
            <p className="text-lg text-muted-foreground">
              Calm, accurate, and empathetic answers for your health questions with a clean, elegant interface.
            </p>
            <div className="flex gap-3">
              <Button variant="hero" size="lg" className="hover-scale" onClick={scrollToChat}>
                Start Chat
              </Button>
              <a href="#chat-section" className="story-link text-sm">Learn more</a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-elegant bg-card animate-scale-in">
            <img src={heroImage} alt="Serene healthcare chat illustration" className="w-full h-auto" loading="lazy" />
          </div>
        </div>
      </header>

      <section id="chat-section" className="container max-w-3xl pb-16">
        <ChatWindow />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <link rel="canonical" href="/" />
    </main>
  );
};

export default Index;
