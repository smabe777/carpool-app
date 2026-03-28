import { Link } from 'react-router-dom'
import SearchForm from '../components/SearchForm'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Travel together, spend less
          </h1>
          <p className="text-xl text-primary-100 mb-10">
            Find or offer a carpool ride in just a few clicks
          </p>
          <SearchForm />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why CarpoolApp?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'Save money', desc: 'Share travel costs and reduce your transportation expenses.' },
              { icon: '🌱', title: 'Eco-friendly', desc: "Fewer cars on the road means less CO₂. Let's act together." },
              { icon: '👥', title: 'Social', desc: 'Meet new people and enjoy the journey in good company.' },
            ].map(f => (
              <div key={f.title} className="card text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Do you have a car?</h2>
        <p className="text-gray-600 mb-8 text-lg">Offer a ride and offset your travel costs.</p>
        <Link to="/create" className="btn-primary py-3 px-8 text-base">
          Offer a ride
        </Link>
      </section>
    </div>
  )
}
