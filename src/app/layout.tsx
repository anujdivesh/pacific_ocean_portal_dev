import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import GlobalReactProvider from './GlobalReactProvider';
// Components
import Navigationbar from "@/components/navbar/Navbar";
import StoreProviderWrapper from "@/components/StoreProviderWrapper";
import ClientBootstrap from "@/components/bootstrap/ClientBootstrap"; // Import the new client component
import ClientAuth from "@/components/ClientAuth";
import GoogleAnalytics from "@/components/tools/googleAnalytics";
import { Toaster } from 'react-hot-toast';
//load all css
import '@/components/css/mapmain.css';
import '@/components/css/accordionmetadata.css' //from accordion_metadata.jsx
import '@/components/css/butttongroup.css'; //from buttonGroup.jsx
import '@/components/css/datepicker.css'; //date_selector.jsx
import '@/components/css/modal.css'; // model.jsx
import '@/components/css/accordion.css'; // nested_accordion.jsx
import '@/components/css/opacity.css'; //opacity.jsx
import '@/components/css/timeseries_scroll.css' //range_slider.jsx
import '@/components/css/welcomemodal.css'; // welcomeModal.jsx
import '@/components/css/workbench.css'; //workbench.jsx
import '@/components/navbar/navbarmodal.css' //Navbar.jsx
import "@/components/navbar/navbar.css";//Navbar.jsx
import "@/components/navbar/sidebar.css";//Navbar.jsx
import "@/components/css/app.css";//Navbar.jsx
import "@/components/css/mapnav.css";//Navbar.jsx
import '@/components/css/nprogress.css'; //loading.jsx
// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pacific Ocean Portal",
  description: "Created by Pacific Community",
  icons: {
    icon: [
      { url: "/icon.ico" }
    ],
    shortcut: ["/icon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <GlobalReactProvider>
      <Toaster position="bottom-right" />

        <GoogleAnalytics />
        <StoreProviderWrapper>

        <ClientAuth />
        <Navigationbar>{children}</Navigationbar>
        </StoreProviderWrapper>
        {/* Use the new ClientBootstrap component */}
        <ClientBootstrap />
        </GlobalReactProvider>
      </body>
    </html>
  );
}