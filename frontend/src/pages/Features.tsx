import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[--background] to-[--card] text-foreground">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 text-foreground">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dive deeper into what makes AI Adventure a unique storytelling experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Interactive Decision Making</h3>
            <p className="text-muted-foreground">
              Choose your path with dynamic GPT-generated choices, including stat-based rolls and consequences.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Session Memory</h3>
            <p className="text-muted-foreground">
              Continue your adventure from where you left off. Each world remembers your choices and character state.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Secure & Personal</h3>
            <p className="text-muted-foreground">
              Your API key never leaves your session. We don’t store it—ever. Customize your AI experience safely.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Immersive Visuals</h3>
            <p className="text-muted-foreground">
              A clean and modern interface puts your narrative front and center, with smooth animations and layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
