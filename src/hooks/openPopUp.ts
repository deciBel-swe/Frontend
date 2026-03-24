'use client';

export const usePopup = () => {
  const openPopup = (url: string, widthRatio = 0.6, heightRatio = 0.6) => {
    const width = Math.floor(window.innerWidth * widthRatio);
    const height = Math.floor(window.innerHeight * heightRatio);

    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    window.open(
      url,
      'popupWindow',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return { openPopup };
};
