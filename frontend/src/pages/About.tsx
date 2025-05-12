import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[--background] to-[--card] text-foreground">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 text-foreground">About AI Adventure</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover a world where your imagination meets AI storytelling. Craft characters, explore fantasy settings,
            and let GPT guide your next adventure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Create Custom Worlds</h3>
            <p className="text-muted-foreground">
              Choose from dark fantasy, sci-fi, high fantasy, or create your own universe with a custom theme.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Narrative or Rules-Lite</h3>
            <p className="text-muted-foreground">
              Whether you prefer immersive storytelling or lightweight RPG mechanics, we've got a mode for you.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Stat-Based Character Growth</h3>
            <p className="text-muted-foreground">
              Gain XP, level up, and improve your character’s strength, spell power, or health as you progress.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Powered by GPT</h3>
            <p className="text-muted-foreground">
              We use OpenAI's GPT models for all narration and world events. Bring your own API key for full control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
