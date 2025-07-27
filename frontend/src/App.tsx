import Layout from "./components/Layout";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import { SpotifyProvider, SpotifyCallback } from "./providers/SpotifyProvider";
import Footer from "./components/Footer";
import { Toaster } from 'react-hot-toast';
import clsx from "clsx";
import "./App.css";

export default function App() {


  // if (connectingSpotify) return (
  //   <div className="h-screen w-full flex items-center justify-center">
  //     <Loader2 className="size-10 text-emerald-600 animate-spin"/>
  //   </div>
  // )

  async function setSession() {
    const response = await fetch("/api/setsession", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Session set successfully:", data.data);
    } else {
      console.error("Failed to set session");
    }
  }


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Header />
      <SpotifyProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/spotify-callback" element={<SpotifyCallback />} />
          <Route path="/home" element={
              <Layout>
                <HomePage />
              </Layout>
          } />
          <Route path="/session" element={
              <Layout>
                <div className="h-[70vh] w-full flex items-center justify-center">
                  <button onClick={setSession} className={clsx("px-4 py-2 bg-blue-500 text-white rounded-lg")}>Set Session</button>
                </div>
              </Layout>
          } />
          <Route path="*" element={
              <Layout>
                (
                  <div className="h-[45vh] w-full flex flex-col items-center justify-center gap-[3rem]">
                    <img className={clsx("notFoundLogo font-dm h-[20rem] aspect-square opacity-[.2] hover:opacity-[.3]")} src="https://nakupimpbqzntlgsthna.supabase.co/storage/v1/object/sign/images/logo_fade.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmI3NTRlZi0zY2NmLTRiZjYtOTI4NS00OTM2M2Y4OGUwMzAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nb19mYWRlLnBuZyIsImlhdCI6MTc1MzYxMTMwMiwiZXhwIjoxNzg1MTQ3MzAyfQ.qlM1TxtBhTCfvJArwVmy_xrH5W-txKpD0g6picBOOxQ" loading="eager" alt="MyTuneTale Faded Logo Image" />
                    <h2 className="font-dm text-4xl font-bold">404 Not Found</h2>
                  </div>
                )
              </Layout>
          } />
        </Routes>
      </SpotifyProvider>
      <Footer />
    </>
  )
}