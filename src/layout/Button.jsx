import React from "react";

const Button = ({ title, variant = "primary", className = "", onClick }) => {
  const variants = {
    destination: "bg-[#bd8157] text-white hover:bg-[#9e653a] hover:text-white",
    primary: "bg-[#bd8157] text-white hover:bg-[#9e653a] hover:text-white",
    secondary: "bg-white text-[#bd8157] hover:bg-[#bd8157] hover:text-white",
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <div>
      <button
        onClick={onClick} 
        className={`${selectedVariant} ${className} rounded-full px-8 py-2 font-medium transition-all duration-300 cursor-pointer`}
      >
        {title}
      </button>
    </div>
  );
};

export default Button;
