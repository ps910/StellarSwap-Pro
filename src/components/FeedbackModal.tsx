import React, { useState } from 'react';
import { Star, MessageSquare, X, Check, ThumbsUp, Share2 } from 'lucide-react';
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
  'Dark/Light theme toggle',
  'Mobile wallet support',
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
    const text = `I just tried StellarSwap+ — a non-custodial DEX & Escrow vault on Stellar Testnet! 🚀 Check it out: https://stellar-swap-pro.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: 'StellarSwap+', text, url: 'https://stellar-swap-pro.vercel.app' });
    } else {
      navigator.clipboard.writeText(text);
    }
    analytics.track('feedback_shared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Thank you for your feedback!</h3>
            <p className="text-xs text-slate-400">Your rating has been recorded for Level 5 submission proof.</p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share StellarSwap+ with friends
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">How was your experience?</h3>
                <p className="text-xs text-slate-400">Help us improve StellarSwap+ for Level 5</p>
              </div>
            </div>

            {/* Star Rating Bar */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Rate your experience</label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* NPS Score */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                How likely are you to recommend StellarSwap+? <span className="text-slate-500">(0-10)</span>
              </label>
              <div className="flex items-center gap-1 justify-center">
                {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                  <button
                    type="button"
                    key={score}
                    onClick={() => setNpsScore(score)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                      npsScore === score
                        ? score >= 9 ? 'bg-lime-400 text-black' : score >= 7 ? 'bg-amber-400 text-black' : 'bg-rose-400 text-black'
                        : 'bg-neutral-800 text-slate-400 hover:bg-neutral-700'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 px-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Feature Requests */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">What features would you like next?</label>
              <div className="flex flex-wrap gap-2">
                {FEATURE_REQUESTS.map((feature) => (
                  <button
                    type="button"
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                      selectedFeatures.includes(feature)
                        ? 'bg-lime-400/10 border-lime-400/40 text-lime-400'
                        : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:border-neutral-700'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Optional Feedback / Notes</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts on speed, UX, or wallet signing..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
