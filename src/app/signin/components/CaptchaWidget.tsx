// 'use client';

// import ReCAPTCHA from 'react-google-recaptcha';

// export default function CaptchaWidget({ onVerify }: { onVerify: (t: string) => void }) {
//   return (
//     <div className="flex justify-center">
//       <ReCAPTCHA
//         sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
//         onChange={(token) => onVerify(token!)}
//       />
//     </div>
//   );
// }
'use client';

export default function CaptchaWidget({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-2 p-4 border rounded-md bg-muted/20">
      <p className="text-sm text-muted-foreground">
        CAPTCHA Placeholder (click to simulate)
      </p>

      <button
        type="button"
        onClick={() => onVerify('placeholder-token')}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        I am not a robot
      </button>
    </div>
  );
}