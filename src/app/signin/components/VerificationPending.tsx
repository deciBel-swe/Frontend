// 'use client';



// export default function VerificationPending({ email }: { email: string }) {
//   const { secondsLeft, start } = useCooldown(60);

//   const resend = async () => {
//     await fetch('/auth/resend-verification', { method: 'POST' });
//     start(); // start cooldown
//   };

//   return (
//     <div className="max-w-md text-center space-y-4">
//       <h2>Check your email</h2>
//       <p>We have sent a verification link to:</p>
//       <p className="font-semibold">{email}</p>

//       <button
//         disabled={secondsLeft > 0}
//         className="btn-secondary"
//         onClick={resend}
//       >
//         {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend verification email'}
//       </button>
//     </div>
//   );
// }