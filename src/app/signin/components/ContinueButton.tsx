'use client'

import React from 'react'

interface ContinueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}



const ContinueButton: React.FC<ContinueButtonProps> = ({ children, ...props }: ContinueButtonProps) => {
  return (
    <button
              {...props} // forward type, disabled, onClick, etc.
              className={`
                w-full h-[2.6rem] rounded font-semibold text-sm transition
                ${props.disabled
                ? "bg-[#999] text-black cursor-not-allowed opacity-60"
                : "bg-white text-black cursor-pointer hover:bg-gray-200"}
                `}           
            >
              {children}
            </button>
  )
}

export default ContinueButton
