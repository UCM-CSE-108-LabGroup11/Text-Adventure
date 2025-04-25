import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[--background] to-[--card] text-foreground">
        <div className="container mx-auto px-4 py-16">
            <Header />
            <HeroSection />
            <FeaturesSection />
            <CallToAction />
        </div>
        </div>
    );
}

function Header() {
    return (
        <nav className="flex items-center justify-between mb-16">
        <div className="text-2xl font-bold">AI Adventure</div>
        <div className="space-x-4">
            <Button variant="default" className="text-foreground hover:text-primary">About</Button>
            <Button variant="default" className="text-foreground hover:text-primary">Features</Button>
            <Button variant="default" className="text-foreground hover:text-primary">Start Playing</Button>
        </div>
        </nav>
    );
}

function HeroSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
        <h1 className="text-6xl font-bold mb-6 text-foreground">
            Embark on an AI-Powered Adventure
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
            Experience unique, dynamically generated stories that adapt to your choices
        </p>
        <Button variant="default" className="text-foreground hover:text-primary">
            Begin Your Journey
        </Button>
        </motion.div>
    );
}

function FeaturesSection() {
    const features = [
        {
            title: "Dynamic Storytelling",
            description: "Every adventure is unique, powered by advanced AI that creates rich, engaging narratives.",
        },
        {
            title: "Meaningful Choices",
            description: "Your decisions matter, shaping the story and leading to different outcomes.",
        },
        {
            title: "Rich World Building",
            description: "Explore detailed worlds with complex characters and intricate plots.",
        },
    ];

  return (
        <div className="grid md:grid-cols-3 gap-8 mb-24">
        {features.map((feature, index) => (
            <Card key={index} className="bg-card border-accent text-card-foreground">
            <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>{feature.description}</CardContent>
            </Card>
        ))}
        </div>
  );
}

function CallToAction() {
    return (
        <div className="text-center">
        <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Start Your Adventure?</h2>
        <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players creating their own unique stories
        </p>
        <div className="space-x-4">
            <Button size="lg" variant="default" className="text-foreground hover:text-primary">
            Play Now
            </Button>
            <Button size="lg" variant="outline" className="text-foreground hover:text-primary">
            Learn More
            </Button>
        </div>
        </div>
    );
}
