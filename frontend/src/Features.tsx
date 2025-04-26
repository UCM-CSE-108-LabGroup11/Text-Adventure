import { useState, useEffect } from "react";

export default function Features () {
    const [features, setMessage] = useState("");

    useEffect (() => {
        const fetchData = async () => {
            const response = await fetch ("https://ip.me");
            const data = await response.json ();
            setMessage (data);
        };

        fetchData ();
    }, []);

    return (
        <div>
            <h1>Features</h1>
            <p>{features}</p>
        </div>
    )
}