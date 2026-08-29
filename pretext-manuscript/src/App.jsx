import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import StackMarquee from './components/StackMarquee.jsx';
import Work from './components/Work.jsx';
import Playground from './components/Playground.jsx';
import Craft from './components/Craft.jsx';
import Contact from './components/Contact.jsx';
import { profile } from './data.js';

export default function App() {
  return (
    <>
      <a
        href="#du-an"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-input focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
      >
        Bỏ qua tới nội dung
      </a>

      <Nav />

      <main>
        <Hero />
        <StackMarquee />
        <Work />
        <Playground />
        <Craft />
        <Contact />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-9 sm:px-8 lg:px-12">
          <p className="font-mono text-[12px] text-muted">
            {profile.name}, {new Date().getFullYear()}
          </p>
          <p className="font-mono text-[12px] text-muted">Dựng bằng React, Three.js và Motion</p>
        </div>
      </footer>
    </>
  );
}
