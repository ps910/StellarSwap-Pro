import React, { useState } from 'react';
import { Star, MessageSquare, X, Check, Share2 } from 'lucide-react';
import { analytics } from '../services/analytics';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const FEATURE_REQUESTS = [
  'More token pairs',
  'Batch escrow operations',
  'Price alerts',
  'TradingView Pro Chart',
  'Hardware wallet support',
  'Transaction history export',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number>(9);
  const [comment, setComment] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment);
    analytics.track('user_feedback_submitted', {
      rating,
      npsScore,
      comment,
      featureRequests: selectedFeatures,
    });
    analytics.persistFeedback(rating, comment);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  const handleShare = () => {
    const text = `I just tested StellarSwap+ — a non-custodial DEX & Escrow vault on Stellar Testnet! 🚀 Check it out: https://stellar-swap-pro.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: 'StellarSwap+', text, url: 'https://stellar-swap-pro.vercel.app' });
    } else {
      navigator.clipboard.writeText(text);
    }
    analytics.track('feedback_shared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-surface border border-b-border shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-text-tertiary hover:text-text-primary rounded-lg bg-elevated transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-bullish/20 text-bullish border border-bullish/40 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Thank you for your feedback!</h3>
            <p className="text-xs text-text-secondary">Your feedback has been recorded for Level 6 review telemetry.</p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 text-xs font-bold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share StellarSwap+ with friends
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Rate Your Experience</h3>
                <p className="text-[11px] text-text-tertiary">Community telemetry for Level 6 Black Belt</p>
              </div>
            </div>

            {/* Star Rating Bar */}
            <div>
              <label className="block text-text-tertiary mb-1.5 font-medium">Satisfaction Rating</label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-gold text-gold'
                          : 'text-b-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* NPS Score */}
            <div>
              <label className="block text-text-tertiary mb-1.5 font-medium">
                Recommendation Likelihood <span className="text-text-disabled">(0-10)</span>
              </label>
              <div className="flex items-center gap-1 justify-center">
                {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setNpsScore(score)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono tabular-nums transition-all ${
                      npsScore === score
                        ? score >= 9 ? 'bg-bullish text-black' : score >= 7 ? 'bg-gold text-black' : 'bg-bearish text-white'
                        : 'bg-elevated text-text-tertiary hover:bg-elevated-hover hover:text-text-primary'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-text-disabled mt-1 px-1">
                <span>Not likely</span>
                <span>Highly recommended</span>
              </div>
            </div>

            {/* Feature Requests */}
            <div>
              <label className="block text-text-tertiary mb-1.5 font-medium">Requested Features for Next Release</label>
              <div className="flex flex-wrap gap-1.5">
                {FEATURE_REQUESTS.map((feature) => (
                  <button
                    type="button"
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                      selectedFeatures.includes(feature)
                        ? 'bg-gold/15 border-gold/40 text-gold'
                        : 'bg-canvas border-b-border text-text-tertiary hover:border-gold/30 hover:text-text-secondary'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-text-tertiary mb-1.5 font-medium">Optional Feedback / Notes</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts on speed, liquidity, or wallet signing..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-elevated text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs shadow-md transition-all"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
