import React from 'react'
import Hero from '../components/Hero'
import { Outlet } from 'react-router'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ContactPage from './ContactPage'
import FaqSection from '../components/FaqSection'

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className='min-h-screen'>
        <Outlet />
      </div>
      <FaqSection />
      <ContactPage />

      <Footer />
    </div>
  )
}

export default HomePage