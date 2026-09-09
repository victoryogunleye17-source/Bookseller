import Browse from "./Browse";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Sell your stories straight to the people who want them.</h1>
          <p className="lede">
            Bookseller is a marketplace for writers, storytellers and independent creators to publish
            their books and work, get paid directly by bank transfer, and build a following that gets
            notified the moment something new drops.
          </p>
          <div className="hero-actions">
            <a href="/register" className="btn btn-primary">
              Start selling
            </a>
            <a href="#browse" className="btn btn-outline">
              Browse the shelf
            </a>
          </div>
        </div>
      </section>
      <div className="wrap" id="browse" style={{ paddingTop: 40 }}>
        <Browse />
      </div>
    </>
  );
}
