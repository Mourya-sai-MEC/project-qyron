import type {Metadata,Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={title:"QYRON STUDIO | Ideas into visuals",description:"Independent creative design studio: branding, logos, posters, social, apparel and automotive visuals."};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#F5F5F4"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  </head><body>{children}</body></html>);
}
