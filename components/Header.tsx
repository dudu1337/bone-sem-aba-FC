import React from 'react';

const Header: React.FC = () => {
  // Usando uma URL externa para garantir que a imagem sempre carregue.
  const bannerImageUrl = "https://i.imgur.com/hL8vU6A.png";

  return (
    <header className="w-full">
       <div className="w-full">
        <img 
          src={bannerImageUrl}
          alt="BonéSemAbaFC - um cartola para nosso mix abençoado" 
          className="w-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </header>
  );
};

export default Header;
