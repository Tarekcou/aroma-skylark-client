import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import emailLottie from "../assets/emaillotties.json";
import FaqSection from "../components/FaqSection";

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center my-10 px-4 py-12 pt-20 min-h-screen">
      {/* Heading Section */}
      <div className="mb-10 text-center">
        <h1 className="font-bold text-gray-800 text-4xl md:text-5xl">
          Connect, Collaborate, Calculate
        </h1>
        <p className="mx-auto mt-2 w-10/12 md:w-8/12 text-gray-600 text-lg">
          Whether you're managing a construction site or tracking shared
          expenses, we're here to help. Let’s simplify the math and bring
          clarity to your project finances.
        </p>
      </div>

     

      {/* Form & Lottie Animation */}
      <div className="flex md:flex-row flex-col-reverse items-center gap-10 w-full max-w-6xl">
        {/* Lottie Section */}
        <div className="w-full md:w-1/2">
          <Player
            autoplay
            loop
            src={emailLottie}
            style={{ height: "250px", width: "100%" }}
          />
        </div>

        {/* Contact Form */}
        <div className="bg-gray-100 shadow-lg p-8 rounded-2xl w-full md:w-1/2">
          <form className="space-y-6">
            <div className="flex gap-2">
              <div className="w-full">
                <label className="label">
                  <span className="text-lg label-text">Your Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-bordered w-full input"
                  required
                />
              </div>
              <div className="w-full">
                <label className="label">
                  <span className="text-lg label-text">Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="input-bordered w-full input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="text-lg label-text">Your Message</span>
              </label>
              <textarea
                className="textarea-bordered w-full min-h-[120px] textarea"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-block text-lg btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>

     
    </div>
  );
};

export default ContactPage;
