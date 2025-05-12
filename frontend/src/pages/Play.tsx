import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Dices } from "lucide-react"; // Icons

interface Theme {
    id: string;
    name: string;
    description: string;
}

const themes: Theme[] = [
    { id: "dark_fantasy", name: "Dark Fantasy", description: "Grim worlds, moral ambiguity, dangerous magic, and a struggle for survival against overwhelming despair." },
    { id: "fairy_tale", name: "Fairy Tale", description: "Enchanted forests, talking animals, curses, royalty, and quests where good often clashes with archetypal evil." },
    { id: "sword_sorcery", name: "Sword and Sorcery", description: "Heroic (often morally grey) adventurers, ancient evils, forbidden magic, and personal quests for power or survival." },
    { id: "superhero", name: "Superhero", description: "Wield extraordinary powers, protect cities, battle distinct villains, and uphold (or question) a moral code." },
    { id: "holidays", name: "Holidays", description: "Adventures themed around festive seasons (like Halloween or Christmas), often whimsical, spooky, or heartwarming." },
    { id: "paranormal", name: "Paranormal", description: "Investigate ghosts, cryptids, psychic phenomena, and unexplained mysteries in modern or historical settings." },
    { id: "cyberpunk", name: "Cyberpunk", description: "Navigate neon-drenched cities, deal with megacorporations, cybernetics, and social decay in a high-tech, low-life future." },
    { id: "sci_fi_fantasy", name: "Sci-Fi/Fantasy", description: "Explore galaxies, encounter aliens, use futuristic tech, or blend magic with spaceships and psionic powers." },
    { id: "wild_west", name: "Wild West", description: "Experience the frontier with cowboys, outlaws, gold rushes, railroads, and perhaps a touch of the supernatural (Weird West)." },
    { id: "post_apocalyptic", name: "Post-Apocalyptic", description: "Survive in the ruins of civilization, facing mutants, scarce resources, and the challenge of rebuilding or succumbing to despair." },
    { id: "steampunk", name: "Steampunk", description: "Adventure in a world of Victorian aesthetics, steam-powered contraptions, airships, clockwork marvels, and social intrigue." },
    // Add more themes in the future maybe
];

export default function WorldSelect () {
    const navigate = useNavigate();
    const [worldName, setWorldName] = useState("");
    const [theme1, setTheme1] = useState<string | undefined>(themes[0].id);
    const [theme2, setTheme2] = useState<string | undefined>(undefined);
    const [mixThemes, setMixThemes] = useState(false);
    const [ruleMode, setRuleMode] = useState("narrative");
    const [customDetails, setCustomDetails] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateWorld = async () => {
        setIsLoading (true);
        setError (null);

        const token = localStorage.getItem ("access_token");
        if (!token) {
            setError ("Authentication error. Please log in again.");
            setIsLoading (false);
            navigate ("/Login");
            return;
        }

        try {
            const response = await fetch("/api/v1/chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                name: worldName || `Random World ${Date.now() % 1000}`,
                rule_mode: ruleMode,
                theme: theme1 || "random",
                theme2: mixThemes ? (theme2 || "random") : null,
                custom_theme: customDetails
                }),
            });

            const data = await response.json ();

            if (!response.ok) {
              throw new Error (data.error || "Failed to create world.");
            }

            navigate (`/Play/${data.id}`, { state: {intro: data.intro } });
        } catch (error: any) {
            setError (error.message || "An unexpected error occurred.");
            console.error ("World creation failed:", error);
        } finally {
            setIsLoading (false);
        }
    };

    const randomizeField = (field: string) => {
        if (field === 'theme1') {
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            setTheme1(randomTheme.id);
        } else if (field === 'theme2' && mixThemes) {
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            setTheme2(randomTheme.id);
        } else if (field === 'ruleMode') {
            const modes = ['narrative', 'rules-lite'];
            setRuleMode(modes[Math.floor(Math.random() * modes.length)]);
        } else if (field === 'worldName') {
            setWorldName(`Random World ${Math.floor(Math.random() * 10000)}`);
        }
    }

    const randomizeAll = () => {
        randomizeField ("worldName");
        randomizeField ("theme1");
        if (mixThemes) randomizeField ("theme2");
        setCustomDetails ("");
    }

    return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
    <h1 className="text-3xl font-bold mb-6 text-center">Create yYour Adventure</h1>
    {error && (
        <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )}

    <Card className="mb-6">
        <CardHeader>
            <CardTitle>World Configuration</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
            {/* World Name */}
            <div className="space-y-2">
            <Label htmlFor="worldName">World Name</Label>
                <div className="flex items-center gap-2">
                <Input
                id="worldName"
                placeholder="E.g., The Whispering Peaks"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={() => randomizeField('worldName')} aria-label="Randomize Name">
                    <Dices className="h-4 w-4" />
                </Button>
            </div>
            </div>

            {/* Theme Carousel 1 */}
            <div className="space-y-2">
            <Label>Primary Theme</Label>
                <div className="flex items-center gap-2">
                <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full max-w-sm mx-auto" // Adjust width as needed
                onValueChange={(value) => setTheme1(value)} // Assuming Carousel can provide value
                >
                <CarouselContent>
                    {themes.map((theme) => (
                    <CarouselItem key={theme.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                        <Card
                            className={`cursor-pointer ${theme1 === theme.id ? "border-primary ring-2 ring-primary" : ""}`}
                            onClick={() => setTheme1(theme.id)}
                        >
                            <CardHeader className="p-3">
                            <CardTitle className="text-sm">{theme.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 text-xs text-muted-foreground">
                            {theme.description}
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                </Carousel>
                    <Button variant="outline" size="icon" onClick={() => randomizeField('theme1')} aria-label="Randomize Theme 1">
                    <Dices className="h-4 w-4" />
                </Button>
            </div>
            </div>

            {/* Theme Mixing Toggle */}
            <div className="flex items-center space-x-2">
            <Switch
                id="mixThemes"
                checked={mixThemes}
                onCheckedChange={setMixThemes}
            />
            <Label htmlFor="mixThemes">Mix a Second Theme?</Label>
            </div>

            {/* Theme Carousel 2 (Conditional) */}
            {mixThemes && (
            <div className="space-y-2">
                <Label>Secondary Theme</Label>
                <div className="flex items-center gap-2">
                <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full max-w-sm mx-auto"
                    onValueChange={(value) => setTheme2(value)}
                >
                    <CarouselContent>
                    {themes.map((theme) => (
                        <CarouselItem key={theme.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card
                            className={`cursor-pointer ${theme2 === theme.id ? "border-primary ring-2 ring-primary" : ""}`}
                            onClick={() => setTheme2(theme.id)}
                            >
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm">{theme.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 text-xs text-muted-foreground">
                                {theme.description}
                            </CardContent>
                            </Card>
                        </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
                    <Button variant="outline" size="icon" onClick={() => randomizeField('theme2')} aria-label="Randomize Theme 2">
                    <Dices className="h-4 w-4" />
                </Button>
                </div>
            </div>
            )}

            {/* Rule Mode */}
            <div className="space-y-2">
            <Label htmlFor="ruleMode">Rule Mode</Label>
                <div className="flex items-center gap-2">
                <Select value={ruleMode} onValueChange={setRuleMode}>
                <SelectTrigger id="ruleMode" className="w-[180px]">
                    <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="narrative">Narrative</SelectItem>
                    <SelectItem value="rules-lite">Rules-Lite</SelectItem>
                </SelectContent>
                </Select>
                    <Button variant="outline" size="icon" onClick={() => randomizeField('ruleMode')} aria-label="Randomize Rule Mode">
                    <Dices className="h-4 w-4" />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                {ruleMode === "narrative"
                ? "Focus on story and choices, no dice rolls or strict rules."
                : "A lighter D&D-like experience with dice rolls for actions."}
            </p>
            </div>

            {/* Custom Details */}
            <div className="space-y-2">
            <Label htmlFor="customDetails">Additional Details (Optional)</Label>
            <Textarea
                id="customDetails"
                placeholder="E.g., 'I want the main villain to be a fallen knight', 'Include a talking animal companion', 'The setting should have floating islands'"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                rows={3}
            />
            </div>
        </CardContent>
    </Card>

    <div className="flex justify-center gap-4 mt-6">
        <Button onClick={randomizeAll} variant="outline" disabled={isLoading}>
            <Dices className="mr-2 h-4 w-4" /> Randomize All
        </Button>
        <Button onClick={handleCreateWorld} disabled={isLoading || !theme1}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Generating World..." : "Start Adventure"}
        </Button>
    </div>
    </div>
    )
}