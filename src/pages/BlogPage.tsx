import React from 'react';
import { ArrowLeft, PenSquare, Calendar, User } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const BlogPage: React.FC = () => {
  const goBack = () => window.history.back();

  const posts = [
    {
      title: "Comment l’IA révolutionne la gestion des avis Google",
      excerpt:
        "Découvrez comment les réponses automatisées et les analyses intelligentes transforment la relation client.",
      author: "Équipe Starlinko",
      date: "12 septembre 2025",
      image: "https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=800",
    },
    {
      title: "5 astuces pour améliorer votre réputation locale",
      excerpt:
        "Optimisez votre visibilité sur Google My Business grâce à des stratégies simples et efficaces.",
      author: "Sophie L.",
      date: "29 août 2025",
      image: "https://images.unsplash.com/photo-1581092334677-1c0658b8a6b5?w=800",
    },
    {
      title: "Pourquoi répondre à chaque avis client fait la différence",
      excerpt:
        "Une réponse personnalisée peut transformer une critique en opportunité. Voici comment.",
      author: "Lucas D.",
      date: "18 août 2025",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4]/10 via-[#34A853]/10 to-[#FBBC05]/10 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <StarlinkoLogo size="md" showText />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-20 h-20 bg-[#FBBC05]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenSquare className="w-10 h-10 text-[#FBBC05]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Le Blog <span className="text-[#4285F4]">Starlinko</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Conseils, stratégies et actualités sur la gestion d’avis clients, 
            la réputation en ligne et l’intelligence artificielle.
          </p>
        </div>

        {/* Articles */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1 text-[#34A853]" />
                    {post.author}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-[#4285F4]" />
                    {post.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => alert("Prochaine fonctionnalité : Blog complet avec CMS 🔥")}
            className="bg-[#4285F4] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#3367D6] transition-all transform hover:scale-105"
          >
            Lire plus d’articles
          </button>
          <p className="text-gray-500 text-sm mt-3">
            🧠 Bientôt disponible : l’espace Blog complet avec CMS intégré
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Starlinko — Tous droits réservés.
      </footer>
    </div>
  );
};

export default BlogPage;
