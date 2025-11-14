import localFont from "next/font/local";

export const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    {
      path: "../public/fonts/WEB/fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/WEB/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/WEB/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/WEB/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const pally = localFont({
  variable: "--font-pally",
  display: "swap",
  src: [
    {
      path: "../public/fonts/WEB/fonts/Pally-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/WEB/fonts/Pally-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/WEB/fonts/Pally-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});
