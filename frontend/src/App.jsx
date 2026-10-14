import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Home  from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Splash  from './pages/Splash'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OtpVerification from './pages/OtpVerification'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import Footer from './components/Footer'
import CreateListing from './pages/CreateListing'
import Profile from './pages/Profile'
import SettingsPage from './pages/SettingsPage'
import MyListings from './pages/MyListings'
import PostTrip from './pages/PostTrip'
import TripMatches from './pages/TripMatches'
import ChatsPage from './pages/ChatsPage'
import MarketplaceChatsPage from './pages/MarketplaceChatsPage'
import TripsPage from './pages/TripsPage'
import TripDetailsPage from './pages/TripsDetailsPage'
import ScrollToTop from './components/ScrollToTop'
import SafetyGuidelinesPage from './pages/SafetyGuidelinesPage'
import HelpFaqPage from './pages/HelpFaqPage'
import CampusRulesPage from './pages/CampusRulesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsConditionsPage from './pages/TermsConditionsPage'
function App() {
  

  return (
    <>
    <ScrollToTop />
     <Routes>
        {/* === UNPROTECTED ROUTES (Anyone can access) === */}
        <Route path='/' element={<Splash />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/otpVerification' element={<OtpVerification />} />
        {/* === PROTECTED ROUTES (Bouncer + Navbar Layout) === */}
        <Route element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
            <Route path='/home' element={<Home />}/>
            <Route path='/marketplace' element={<Marketplace />} />
            <Route path='/marketplace/create' element={<CreateListing />} />
            <Route path='marketplace/:id' element={<ListingDetail />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/my-listings' element={<MyListings />} />
            <Route path='/post-trip' element={<PostTrip />} />
            <Route path='/trip-matches' element={<TripMatches />} />
             <Route path='/trips' element={<TripsPage />} />
             <Route path='/view-details/:tripId' element= {<TripDetailsPage />} />
             <Route path='/chats' element={<ChatsPage />} />
             <Route path='/marketplace/chats' element={<MarketplaceChatsPage />} />
             <Route path='/safety' element={<SafetyGuidelinesPage />} />
             <Route path='/help' element={<HelpFaqPage />} />
             <Route path='/campus-rules' element={<CampusRulesPage />} />
             <Route path='/about' element={<AboutPage />} />
             <Route path='/contact' element={<ContactPage />} />
             <Route path='/privacy' element={<PrivacyPolicyPage />} />
             <Route path='/terms' element={<TermsConditionsPage />} />
        </Route>
       
        
      </Routes>

    </>
  )
}

export default App
