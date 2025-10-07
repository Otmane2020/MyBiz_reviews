import React, { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import StarlinkoLogo from "../components/StarlinkoLogo";

const ContactPage: React.FC = () => {
  const goBack = () => window.history.back();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // 👉 Ici tu peux plus tard connecter Supabase ou Formspree pour l’envoi réel
    console.log("Message envoyé :", formData);
  };

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

      {/* Main content */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-20 h-20 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-[#4285F4]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Une question, une suggestion ou un partenariat ? L’équipe <strong>Starlinko</strong> est à votre écoute.
          </p>
        </div>

        {/* Contact form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4285F4] focus:outline-none"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#34A853] focus:outline-none"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FBBC05] focus:outline-none"
                placeholder="Votre message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center bg-[#4285F4] text-white w-full py-3 rounded-full font-semibold text-lg hover:bg-[#3367D6] transition-all transform hover:scale-105"
            >
              Envoyer le message
              <Send className="w-5 h-5 ml-2" />
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Merci 🎉</h2>
            <p className="text-gray-600">
              Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-[#4285F4] hover:underline font-medium"
            >
              Envoyer un autre message
            </button>
          </div>
        )}

        {/* Contact infos */}
        <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Phone className="w-8 h-8 text-[#34A853] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
            <p className="text-gray-600 text-sm">+33 1 84 60 22 33</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Mail className="w-8 h-8 text-[#4285F4] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
            <p className="text-gray-600 text-sm">support@starlinko.com</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <MapPin className="w-8 h-8 text-[#FBBC05] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
            <p className="text-gray-600 text-sm">280 Boulevard de la Boissière<br />93100 Montreuil, France</p>
          </div>
        </div>

        {/* Map */}
        <div className="max-w-4xl mx-auto mt-12">
          <iframe
            title="Starlinko Map"
            src="https://www.google.com/m
