import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/AuthContext";

import {
    Card, 
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object ({
    username: z.string ().min (2, {
        message: "Username must be at least 2 characters."
    }).max (255, {
        message: "Username must be fewer than 256 characters."
    }),
    email: z.string ().min (7, {
        message: "Enter a valid email."
    }).max (255, {
        message: "Email must be fewer than 256 characters."
    }).email ("Enter a valid email."),
    password1: z.string ().min (6, {
        message: "Password must be at least 6 characters."
    }).max (255, {
        message: "Password must be fewer than 256 characters."
    }),
    password2: z.string ()
}).refine ((data) => data.password1 === data.password2, {
    message: "Passwords do not match.",
    path: ["password2"]
})

export default function Signup () {
    const navigate = useNavigate ();
    const [isLoading, setIsLoading] = useState (false);
    const [formError, setFormError] = useState<string | null> (null);
    const { fetchUser } = useAuth();

    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver (formSchema),
        defaultValues: {
            username: "",
            email: "",
            password1: "",
            password2: "",
        }
    })

    async function onSubmit (values: z.infer<typeof formSchema>) {
        setIsLoading (true);
        setFormError (null);

        try {
            const response = await fetch (`/api/v1/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify (values),
            });

            const data = await response.json ();

            if (!response.ok) {
                if (data.message) {
                    if (response.status === 400 && data.field_errors) {
                        for (const [field, message] of Object.entries (data.field_errors)) {
                            form.setError (field as keyof z.infer<typeof formSchema>, {
                                type: "manual",
                                message: message as string,
                            });
                        }
                    } else {
                        setFormError (data.message || "Signup failed. Please try again.");
                    }
                } else {
                    setFormError ("An unknown error occurred during signup.");
                }
                setIsLoading (false);
                return;
            }

            console.log ("Signup successful:", data);
            localStorage.setItem ("access_token", data.access_token);
            console.log("Token:", data.access_token);
            await fetchUser(); 
            navigate ("/login");
        } catch (error) {
            console.error ("Signup request failed:", error);
            setFormError ("An error occurred. Please check your connection and try again.");
        } finally {
            setIsLoading (false);
        }
    }

    return (
    <div className="flex items-center justify-center min-h-screen">
    <Card className="w-[350px]">
        <CardHeader>
            <CardTitle>Sign Up!</CardTitle>
            <CardDescription>Create your account...</CardDescription>
        </CardHeader>

        <CardContent><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                    <FormLabel>Username: </FormLabel>
                    <FormControl>
                        <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                    <FormLabel>Email Address: </FormLabel>
                    <FormControl>
                        <Input placeholder="Email Address" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="password1" render={({ field }) => (
                <FormItem>
                    <FormLabel>Password: </FormLabel>
                    <FormControl>
                        <Input placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="password2" render={({ field }) => (
                <FormItem>
                    <FormLabel>Confirm Password: </FormLabel>
                    <FormControl>
                        <Input placeholder="Confirm Password" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            {formError && (
                <div className="text-sm font-medium text-destructive">
                    {formError}
                </div>
            )}

            <Button type="submit" disabled={isLoading}>{isLoading ? "Signing up..." : "Sign Up!"}</Button>
        </form></Form></CardContent>
    </Card>
    </div>
    )
}