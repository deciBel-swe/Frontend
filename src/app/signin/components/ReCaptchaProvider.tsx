'use client'

import { GoogleReCaptchaProvider }  from "react-google-recaptcha-v3"
import React from "react"

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({ children }) => {

    return(
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECATCHA_SITE_KEY!}
        
        >
            {children}
        </GoogleReCaptchaProvider>
    );
};

export default ReCaptchaProvider;