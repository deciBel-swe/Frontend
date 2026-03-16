'use client'

import React from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const FormWithReCaptcha: React.FC = () => {
    const {executeRecaptcha} = useGoogleReCaptcha();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if(!executeRecaptcha) {
            return;
        }

        const token = await executeRecaptcha("submit_form");
        console.log("ReCaptcha token:", token);

        const response = await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if(data.success) {
            console.log("ReCaptcha verification successful, score:", data.score);
            // Proceed with form submission or other actions
        } else {
            console.log("ReCaptcha verification failed, score:", data.score, "errors:", data.errors);
            // Handle verification failure (e.g., show error message)
        }
    };
        // send token to backend for verification and form submission
        return(
            <form onSubmit={handleSubmit}>
      <button type="submit">Submit with ReCaptcha</button>
    </form>
        );
    
};

export default FormWithReCaptcha;