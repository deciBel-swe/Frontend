export const SOCIAL_SHARE_LINKS = {
  FACEBOOK: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  TWITTER: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
  PINTEREST: (url: string, media: string, description: string) =>
    `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`,
  TUMBLR: (url: string, title: string) =>
    `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}`,
  MAIL_TO: (url: string, subject: string) =>
    `mailto:?subject=${subject}&body=${url}`,
};
