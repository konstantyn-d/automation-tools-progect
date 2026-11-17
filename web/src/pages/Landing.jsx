import Hero from '../sections/Hero.jsx'
import Proof from '../sections/Proof.jsx'
import Capabilities from '../sections/Capabilities.jsx'
import Courses from '../sections/Courses.jsx'
import LessonBand from '../sections/LessonBand.jsx'
import WordGrid from '../sections/WordGrid.jsx'
import Pricing from '../sections/Pricing.jsx'
import Faq from '../sections/Faq.jsx'
import Closing from '../sections/Closing.jsx'

// The landing page is a list of sections, top to bottom.
export default function Landing({ onNav }) {
  return (
    <>
      <main>
        <Hero onNav={onNav} />
        <Proof />
        <Courses />
        <Capabilities />
        <LessonBand />
        <WordGrid />
        <Pricing />
        <Faq />
      </main>
      <Closing onNav={onNav} />
    </>
  )
}
