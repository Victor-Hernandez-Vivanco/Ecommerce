import Navbar from './components/Navbar'
import Carousel from './components/Carousel'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import Features from './components/Features'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Carousel />
      <Hero />
      <FeaturedProducts />
      <Features />
      <Footer />
    </main>
  )
}