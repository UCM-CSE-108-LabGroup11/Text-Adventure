import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/AuthContext";


import {
    Card,
    CardHeader,
    CardTitle,
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
    username: z.string ().min(2, {
        message: "Enter a valid username/email."
    }).max (255, {
        message: "Enter a valid username/email."
    }),
    password: z.string ().min (6, {
        message: "Enter a valid password."
    }).max (255, {
        message: "Enter a valid password."
    })
})

export default function Login () {
    const navigate = useNavigate ();
    const [isLoading, setIsLoading] = useState (false);
    const [formError, setFormError] = useState<string | null> (null);
    const { fetchUser } = useAuth();
    const BASE_URL = "http://localhost:5000";

    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver (formSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    async function onSubmit ( values: z.infer<typeof formSchema> ) {
        setIsLoading (true);
        setFormError (null);

        try {
            const response = await fetch (`${BASE_URL}/api/v1/auth/login`, {
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
                        setFormError (data.message || "Login failed. Please try again.");
                    }
                } else {
                    setFormError ("An unknown error occurred.");
                }
                setIsLoading (false);
                return;
            }

            console.log ("Login successful:", data);
            localStorage.setItem("access_token", data.access_token);
            console.log("Token:", data.access_token);
            await fetchUser();              
            navigate("/Play");
            // window.location.href = "/Play"
        } catch (error) {
            console.error ("Login request failed:", error);
            setFormError ("An error occurred. Please check your connection and try again.");
        } finally {
            setIsLoading (false);
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Log In!</CardTitle>
            </CardHeader>
      
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email: </FormLabel>
                        <FormControl>
                          <Input placeholder="Username or Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
      
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password: </FormLabel>
                        <FormControl>
                          <Input placeholder="Password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
      
                  {formError && (
                    <div className="text-sm font-medium text-destructive">
                      {formError}
                    </div>
                  )}
      
                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Log In!"}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      );
}