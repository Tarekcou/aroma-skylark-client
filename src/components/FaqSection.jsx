import { Player } from "@lottiefiles/react-lottie-player";
import questionLottie from "../assets/questionLottie.json"
const FaqSection = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click the 'Sign Up' button in the top right corner and follow the registration process.",
    },
    {
      question: "Can I track daily and monthly expenses?",
      answer:
        "Yes. Our software lets you monitor both daily and monthly constructional transactions with charts and summaries.",
    },
    {
      question: "Is there a way to add custom product units?",
      answer:
        "Absolutely. You can add new units during product entry or select from existing ones like bag, kg, piece, or CFT.",
    },
    {
      question: "How do I add members and track installments?",
      answer:
        "Navigate to the Members section to add individuals and manage their installment contributions easily.",
    },
    {
      question: "Can I view category-wise expense reports?",
      answer:
        "Yes, the dashboard provides graphs and pie charts for category-based expenses with visual insights.",
    },
  ];

  return (
    <div className="space-y-4 mx-auto mt-10 w-10/12">
      <h2 className="my-4 font-bold text-xl md:text-3xl text-center">
        Frequently Asked Questions
      </h2>
      <div className="flex md:flex-row flex-col">
        <div className="md:hidden w-full md:w-1/2">
          <Player
            autoplay
            loop
            src={questionLottie}
            className="w-36 md:w-64"
          />
        </div>
        <div className="w-full md:w-1/2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              tabIndex={0}
              className="collapse collapse-arrow bg-base-100 border border-base-300"
            >
              <div className="collapse-title font-semibold">{faq.question}</div>
              <div className="collapse-content text-sm">{faq.answer}</div>
            </div>
          ))}
        </div>
        <div className="hidden md:block w-full md:w-1/2">
          <Player
            autoplay
            loop
            src={questionLottie}
            style={{ height: "250px", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
